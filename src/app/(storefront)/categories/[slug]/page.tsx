import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, SlidersHorizontal } from "lucide-react";
import { getCategoryBySlug, getPublishedProducts, getCategoryBrands } from "@/modules/catalog/queries";
import { ProductGrid } from "../../_components/product-grid";
import { ProductFilters } from "../../_components/product-filters";
import { Pagination } from "../../_components/pagination";
import { parseProductFilters, flattenSearchParams } from "../../_lib/parse-product-search-params";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Readonly<CategoryPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.seoTitle || `${category.name} Price in Kenya | Nuru Energy`,
    description: category.seoDescription || category.description || `Shop ${category.name} at Nuru Energy.`,
    alternates: { canonical: category.canonicalUrl || `/categories/${category.slug}` },
  };
}

function removeFilterUrl(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  paramToRemove: string,
) {
  const params = new URLSearchParams();
  const merged = { ...searchParams, [paramToRemove]: undefined, page: undefined };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default async function CategoryPage({ params, searchParams }: Readonly<CategoryPageProps>) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const rawParams = flattenSearchParams(await searchParams);
  const filters = { ...parseProductFilters(rawParams), categorySlug: category.slug };

  const [{ products, total, page, totalPages }, brands] = await Promise.all([
    getPublishedProducts(filters),
    getCategoryBrands(category.slug),
  ]);

  const basePath = `/categories/${category.slug}`;

  // Find active brand object for chip display
  const activeBrandObj = brands.find((b) => b.slug === filters.brandSlug);

  const hasActiveFilters =
    Boolean(filters.brandSlug) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.inStock) ||
    Boolean(filters.onSale) ||
    Boolean(filters.q);

  // Category tree with subcategories and counts for sidebar
  const categoryFilterTree = [
    {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isFeatured: category.isFeatured,
      productCount: total,
      totalProductCount: total,
      children: category.children,
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      {/* Category Header Banner */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/80 bg-surface-muted/40 p-6 sm:flex-row sm:items-center">
        {category.imageUrl && (
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-48 bg-surface">
            <Image src={category.imageUrl} alt={category.name} fill sizes="192px" className="object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{category.name}</h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              {total} item{total === 1 ? "" : "s"}
            </span>
          </div>
          {category.description && <p className="text-sm text-neutral-500">{category.description}</p>}
          {category.children.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-foreground hover:border-brand-500/50 hover:text-brand-600 shadow-2xs transition-colors"
                >
                  <span>{child.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({child.productCount})</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          basePath={basePath}
          searchParams={rawParams}
          categories={categoryFilterTree}
          brands={brands}
          activeCategorySlug={category.slug}
          activeBrandSlug={filters.brandSlug}
        />

        <div className="flex flex-1 flex-col gap-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-surface px-4 py-3 shadow-2xs">
              <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 mr-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                Active Filters:
              </span>

              {activeBrandObj && (
                <Link
                  href={removeFilterUrl(basePath, rawParams, "brand")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 shadow-2xs"
                >
                  <span>Brand: {activeBrandObj.name}</span>
                  <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
                </Link>
              )}

              {filters.inStock && (
                <Link
                  href={removeFilterUrl(basePath, rawParams, "inStock")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 shadow-2xs"
                >
                  <span>In Stock Only</span>
                  <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
                </Link>
              )}

              {filters.onSale && (
                <Link
                  href={removeFilterUrl(basePath, rawParams, "onSale")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1 text-xs font-semibold text-danger-700 hover:bg-danger-100 dark:bg-danger-950/60 dark:text-danger-200 shadow-2xs"
                >
                  <span>On Sale</span>
                  <X className="h-3.5 w-3.5 text-danger-700 dark:text-danger-200" />
                </Link>
              )}

              {filters.minPrice !== undefined && (
                <Link
                  href={removeFilterUrl(basePath, rawParams, "min")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 shadow-2xs"
                >
                  <span>Min: Ksh {filters.minPrice.toLocaleString()}</span>
                  <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
                </Link>
              )}

              {filters.maxPrice !== undefined && (
                <Link
                  href={removeFilterUrl(basePath, rawParams, "max")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 shadow-2xs"
                >
                  <span>Max: Ksh {filters.maxPrice.toLocaleString()}</span>
                  <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
                </Link>
              )}

              <Link
                href={basePath}
                className="ml-auto text-xs font-bold text-neutral-500 hover:text-danger-600 transition-colors"
              >
                Clear All
              </Link>
            </div>
          )}

          <ProductGrid products={products} emptyDescription="No products match your filter criteria in this category." />
          <Pagination basePath={basePath} searchParams={rawParams} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
