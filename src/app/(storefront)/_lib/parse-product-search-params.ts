import type { ProductListFilters, ProductSort } from "@/modules/catalog/queries";

export interface RawProductSearchParams {
  category?: string;
  brand?: string;
  q?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
  onSale?: string;
}

const VALID_SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "name-asc"];

function isProductSort(value: string | undefined): value is ProductSort {
  return VALID_SORTS.includes(value as ProductSort);
}

/** Shared by /shop, /search, /categories/[slug] and /brands/[slug] — turns raw URL search params into typed query filters. */
export function parseProductFilters(searchParams: RawProductSearchParams): ProductListFilters {
  return {
    categorySlug: searchParams.category || undefined,
    brandSlug: searchParams.brand || undefined,
    q: searchParams.q || undefined,
    minPrice: searchParams.min ? Number(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
    sort: isProductSort(searchParams.sort) ? searchParams.sort : undefined,
    page: searchParams.page ? Number(searchParams.page) : undefined,
    onSale: searchParams.onSale === "true" || undefined,
  };
}

/** Normalizes Next's `Record<string, string | string[] | undefined>` searchParams shape into flat strings. */
export function flattenSearchParams(raw: Record<string, string | string[] | undefined>): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }
  return result;
}
