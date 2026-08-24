import { db } from "@/infrastructure/database/client";
import type { Prisma } from "@/generated/prisma/client";

export const PRODUCTS_PER_PAGE = 12;

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { publishedAt: "desc" },
  "price-asc": { sellingPrice: "asc" },
  "price-desc": { sellingPrice: "desc" },
  "name-asc": { name: "asc" },
};

export interface ProductListFilters {
  categorySlug?: string;
  brandSlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  /** "On sale" is treated as `previousPrice` being set at all — the admin product form only ever sets it to record a genuine markdown from a higher original price, so presence alone is a reliable proxy without a field-to-field DB comparison. */
  onSale?: boolean;
  inStock?: boolean;
}

const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  sellingPrice: true,
  previousPrice: true,
  hidePrice: true,
  isQuotationOnly: true,
  brand: { select: { name: true, slug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, altText: true },
  },
  inventoryItem: {
    select: { quantityOnHand: true, reservedQuantity: true, lowStockThreshold: true, allowBackorder: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof PRODUCT_CARD_SELECT }>;

/**
 * Public, published-only product listing — the only entry point the
 * storefront should use for browsing. Always filters `status: "ACTIVE"` so a
 * draft/hidden/archived product can never appear here, unlike the admin
 * list pages which query `db.product` directly and intentionally see every
 * status.
 */
export async function getPublishedProducts(filters: ProductListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const sort = filters.sort ?? "newest";

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    // Matches the category itself OR a product whose category's *parent* is
    // this slug — so selecting a parent (e.g. "Solar Inverters") aggregates
    // products filed directly under its children (e.g. "Hybrid Solar
    // Inverters"), rather than only ever matching products with no
    // sub-category at all.
    ...(filters.categorySlug && {
      category: { OR: [{ slug: filters.categorySlug }, { parent: { slug: filters.categorySlug } }] },
    }),
    ...(filters.brandSlug && { brand: { slug: filters.brandSlug } }),
    ...(filters.onSale && { previousPrice: { not: null } }),
    ...(filters.inStock && { inventoryItem: { quantityOnHand: { gt: 0 } } }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      sellingPrice: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { model: { contains: filters.q, mode: "insensitive" } },
        { shortDescription: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy: SORT_ORDER_BY[sort],
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize: PRODUCTS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}

/**
 * Real, currently-discounted products for the homepage "Deals" row —
 * ordered by biggest discount, never a fabricated "deal ends in…" countdown
 * (there's no deal-expiry field in the schema, so we don't invent one).
 * Fetches a modest candidate batch and sorts by discount % in JS since
 * Prisma can't order by a computed `previousPrice - sellingPrice` expression
 * without raw SQL — fine at this catalog size, unlike `getPublishedProducts`
 * where pagination correctness matters more than raw-SQL avoidance.
 */
export async function getDealProducts(limit = 8) {
  const candidates = await db.product.findMany({
    where: { status: "ACTIVE", previousPrice: { not: null }, hidePrice: false, isQuotationOnly: false },
    select: PRODUCT_CARD_SELECT,
    take: 40,
    orderBy: { publishedAt: "desc" },
  });

  return candidates
    .map((product) => ({
      product,
      discount: 1 - Number(product.sellingPrice) / Number(product.previousPrice),
    }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit)
    .map(({ product }) => product);
}

/** A handful of ACTIVE products for a homepage category row — same parent/child aggregation as {@link getPublishedProducts}, just uncapped by pagination. */
export async function getCategoryProductPreview(categorySlug: string, limit = 6) {
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      category: { OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }] },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** A single published product for the detail page — `null` (→ `notFound()`) for any non-ACTIVE or missing slug. */
export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
      specifications: {
        include: { field: { select: { label: true, unit: true, displayOrder: true } } },
      },
      inventoryItem: {
        select: { quantityOnHand: true, reservedQuantity: true, lowStockThreshold: true, allowBackorder: true },
      },
    },
  });

  if (product?.status !== "ACTIVE") {
    return null;
  }
  return product;
}

export interface ActiveCategoryChild {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface ActiveCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isFeatured: boolean;
  productCount: number;
  totalProductCount: number;
  children: ActiveCategoryChild[];
}

/**
 * Active top-level categories with their active children and real product
 * counts, for nav + shop filters. A category (or its whole subtree) with
 * zero ACTIVE products is excluded entirely — it would otherwise be a
 * dead-end filter link that always resolves to "no products found". A
 * parent still surfaces if only its children have products, since selecting
 * it aggregates them (see `getPublishedProducts`'s category filter).
 */
export async function getActiveCategories(): Promise<ActiveCategory[]> {
  const categories = await db.category.findMany({
    where: { isActive: true, parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      isFeatured: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
      children: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { status: "ACTIVE" } } } },
        },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return categories
    .map((category) => {
      const children = category.children
        .map((child) => ({ id: child.id, name: child.name, slug: child.slug, productCount: child._count.products }))
        .filter((child) => child.productCount > 0);
      const ownCount = category._count.products;
      const childrenTotal = children.reduce((acc, child) => acc + child.productCount, 0);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        isFeatured: category.isFeatured,
        productCount: ownCount,
        totalProductCount: ownCount + childrenTotal,
        children,
      };
    })
    .filter((category) => category.totalProductCount > 0);
}

/** A single active category landing page — `null` (→ `notFound()`) if inactive or missing. Children are filtered to those with at least one ACTIVE product, same rule as {@link getActiveCategories}. */
export async function getCategoryBySlug(slug: string) {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, _count: { select: { products: { where: { status: "ACTIVE" } } } } },
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  if (!category?.isActive) {
    return null;
  }
  return {
    ...category,
    children: category.children
      .map((child) => ({ id: child.id, name: child.name, slug: child.slug, productCount: child._count.products }))
      .filter((child) => child.productCount > 0),
  };
}

export interface ActiveBrand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

/** Active brands with at least one ACTIVE product — a brand with none would be a dead-end filter link. */
export async function getActiveBrands(): Promise<ActiveBrand[]> {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, _count: { select: { products: { where: { status: "ACTIVE" } } } } },
    orderBy: { name: "asc" },
  });

  return brands
    .map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug, productCount: brand._count.products }))
    .filter((brand) => brand.productCount > 0);
}

/** Fetch only brands that have active products in the specified category (or its children). */
export async function getCategoryBrands(categorySlug: string): Promise<ActiveBrand[]> {
  const brands = await db.brand.findMany({
    where: {
      isActive: true,
      products: {
        some: {
          status: "ACTIVE",
          category: {
            OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: {
              status: "ACTIVE",
              category: {
                OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    productCount: b._count.products,
  }));
}

/** A single active brand landing page — `null` (→ `notFound()`) if inactive or missing. */
export async function getBrandBySlug(slug: string) {
  const brand = await db.brand.findUnique({ where: { slug } });
  if (!brand?.isActive) {
    return null;
  }
  return brand;
}

/** Fetch active products matching a list of category slugs for a solution landing page */
export async function getSolutionProducts(categorySlugs: string[], limit = 8) {
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      category: {
        OR: [
          { slug: { in: categorySlugs } },
          { parent: { slug: { in: categorySlugs } } },
        ],
      },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** Slug + updatedAt only, for sitemap.ts — never more than a published entity should expose. */
export async function getPublishedProductSlugs() {
  return db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } });
}

export async function getActiveCategorySlugs() {
  return db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
}

export async function getActiveBrandSlugs() {
  return db.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
}
