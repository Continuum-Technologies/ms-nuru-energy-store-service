import type { Metadata } from "next";
import Link from "next/link";
import { X, SlidersHorizontal } from "lucide-react";
import { getPublishedProducts, getActiveCategories, getActiveBrands } from "@/modules/catalog/queries";
import { ProductGrid } from "../_components/product-grid";
import { ProductFilters } from "../_components/product-filters";
import { Pagination } from "../_components/pagination";
import { parseProductFilters, flattenSearchParams } from "../_lib/parse-product-search-params";

export const metadata: Metadata = {
  title: "Shop All Equipment | Nuru Energy Store",
  description:
    "Browse solar panels, lithium batteries, hybrid inverters, silent diesel generators, solar borehole pumps and machinery equipment in stock in Kenya.",
  alternates: { canonical: "/shop" },
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function removeFilterUrl(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  paramToRemove: string
) {
  const params = new URLSearchParams();
  const merged = { ...searchParams, [paramToRemove]: undefined, page: undefined };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default async function ShopPage({ searchParams }: Readonly<ShopPageProps>) {
  const rawParams = flattenSearchParams(await searchParams);
  const filters = parseProductFilters(rawParams);

  const [{ products, total, page, totalPages }, categories, brands] = await Promise.all([
    getPublishedProducts(filters),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  // Active label resolutions for filter tags
  const activeCategoryObj =
    categories.find((c) => c.slug === filters.categorySlug) ??
    categories.flatMap((c) => c.children).find((c) => c.slug === filters.categorySlug);

  const activeBrandObj = brands.find((b) => b.slug === filters.brandSlug);

  const hasActiveFilters =
    Boolean(filters.categorySlug) ||
    Boolean(filters.brandSlug) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.q);

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {activeCategoryObj ? activeCategoryObj.name : "All Equipment"}
        </h1>
        <p className="text-sm text-neutral-500">
          Showing {total} product{total === 1 ? "" : "s"} available across Kenya.
        </p>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-2xs">
          <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
            Active Filters:
          </span>

          {activeCategoryObj && (
            <Link
              href={removeFilterUrl("/shop", rawParams, "category")}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-600/15 dark:text-brand-200"
            >
              <span>Category: {activeCategoryObj.name}</span>
              <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
            </Link>
          )}

          {activeBrandObj && (
            <Link
              href={removeFilterUrl("/shop", rawParams, "brand")}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-600/15 dark:text-brand-200"
            >
              <span>Brand: {activeBrandObj.name}</span>
              <X className="h-3.5 w-3.5 text-brand-700 dark:text-brand-200" />
            </Link>
          )}

          {filters.minPrice !== undefined && (
            <Link
              href={removeFilterUrl("/shop", rawParams, "min")}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
            >
              <span>Min: Ksh {filters.minPrice.toLocaleString()}</span>
              <X className="h-3.5 w-3.5 text-neutral-500" />
            </Link>
          )}

          {filters.maxPrice !== undefined && (
            <Link
              href={removeFilterUrl("/shop", rawParams, "max")}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
            >
              <span>Max: Ksh {filters.maxPrice.toLocaleString()}</span>
              <X className="h-3.5 w-3.5 text-neutral-500" />
            </Link>
          )}

          {filters.q && (
            <Link
              href={removeFilterUrl("/shop", rawParams, "q")}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
            >
              <span>Query: &quot;{filters.q}&quot;</span>
              <X className="h-3.5 w-3.5 text-neutral-500" />
            </Link>
          )}

          <Link
            href="/shop"
            className="ml-auto text-xs font-semibold text-danger-600 hover:underline"
          >
            Clear All
          </Link>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          basePath="/shop"
          searchParams={rawParams}
          categories={categories}
          brands={brands}
          activeCategorySlug={filters.categorySlug}
          activeBrandSlug={filters.brandSlug}
        />

        <div className="flex flex-1 flex-col gap-6">
          <ProductGrid products={products} />
          <Pagination basePath="/shop" searchParams={rawParams} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
