import type { Metadata } from "next";
import { getPublishedProducts, getActiveCategories, getActiveBrands } from "@/modules/catalog/queries";
import { ProductGrid } from "../_components/product-grid";
import { ProductFilters } from "../_components/product-filters";
import { Pagination } from "../_components/pagination";
import { parseProductFilters, flattenSearchParams } from "../_lib/parse-product-search-params";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Readonly<SearchPageProps>): Promise<Metadata> {
  const { q } = flattenSearchParams(await searchParams);
  return {
    title: q ? `Search results for "${q}" | Nuru Energy Store` : "Search | Nuru Energy Store",
  };
}

export default async function SearchPage({ searchParams }: Readonly<SearchPageProps>) {
  const rawParams = flattenSearchParams(await searchParams);
  const filters = parseProductFilters(rawParams);

  const [{ products, page, totalPages }, categories, brands] = await Promise.all([
    getPublishedProducts(filters),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {filters.q ? (
            <>
              Search results for <span className="text-brand-600 dark:text-brand-400">&quot;{filters.q}&quot;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <p className="text-sm text-neutral-500">{products.length > 0 && `${products.length} product${products.length === 1 ? "" : "s"} found`}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          basePath="/search"
          searchParams={rawParams}
          categories={categories}
          brands={brands}
          activeCategorySlug={filters.categorySlug}
          activeBrandSlug={filters.brandSlug}
        />

        <div className="flex flex-1 flex-col gap-6">
          <ProductGrid
            products={products}
            emptyTitle={filters.q ? `No results for "${filters.q}"` : "Enter a search term"}
            emptyDescription="Try a different keyword, or browse the full catalog instead."
          />
          <Pagination basePath="/search" searchParams={rawParams} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
