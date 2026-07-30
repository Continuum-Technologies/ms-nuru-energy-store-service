import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCategoryBySlug, getPublishedProducts, getActiveBrands } from "@/modules/catalog/queries";
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
    title: category.seoTitle || `${category.name} Price in Kenya | Nuru Energy Store`,
    description: category.seoDescription || category.description || `Shop ${category.name} at Nuru Energy Store.`,
    alternates: { canonical: category.canonicalUrl || `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Readonly<CategoryPageProps>) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const rawParams = flattenSearchParams(await searchParams);
  const filters = { ...parseProductFilters(rawParams), categorySlug: category.slug };

  const [{ products, page, totalPages }, brands] = await Promise.all([
    getPublishedProducts(filters),
    getActiveBrands(),
  ]);

  const basePath = `/categories/${category.slug}`;

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/80 bg-surface-muted/40 p-6 sm:flex-row sm:items-center">
        {category.imageUrl && (
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
            <Image src={category.imageUrl} alt={category.name} fill sizes="192px" className="object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{category.name}</h1>
          {category.description && <p className="text-sm text-neutral-500">{category.description}</p>}
          {category.children.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="rounded-pill border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-foreground hover:border-brand-500/50 hover:text-brand-600"
                >
                  {child.name}
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
          categories={[]}
          brands={brands}
          activeBrandSlug={filters.brandSlug}
        />

        <div className="flex flex-1 flex-col gap-6">
          <ProductGrid products={products} emptyDescription="No products in this category yet — check back soon." />
          <Pagination basePath={basePath} searchParams={rawParams} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
