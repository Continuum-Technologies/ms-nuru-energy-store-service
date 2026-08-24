import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBrandBySlug, getPublishedProducts, getActiveCategories } from "@/modules/catalog/queries";
import { ProductGrid } from "../../_components/product-grid";
import { ProductFilters } from "../../_components/product-filters";
import { Pagination } from "../../_components/pagination";
import { parseProductFilters, flattenSearchParams } from "../../_lib/parse-product-search-params";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Readonly<BrandPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};

  return {
    title: brand.seoTitle || `${brand.name} Products in Kenya | Nuru Energy`,
    description: brand.seoDescription || brand.description || `Shop genuine ${brand.name} equipment at Nuru Energy.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: Readonly<BrandPageProps>) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const rawParams = flattenSearchParams(await searchParams);
  const filters = { ...parseProductFilters(rawParams), brandSlug: brand.slug };

  const [{ products, page, totalPages }, categories] = await Promise.all([
    getPublishedProducts(filters),
    getActiveCategories(),
  ]);

  const basePath = `/brands/${brand.slug}`;

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface-muted/40 p-6 sm:flex-row sm:items-center">
        {brand.logoUrl && (
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-surface">
            <Image src={brand.logoUrl} alt={brand.name} fill sizes="128px" className="object-contain p-2" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{brand.name}</h1>
          {brand.countryOfOrigin && <p className="text-xs font-semibold text-neutral-400">{brand.countryOfOrigin}</p>}
          {brand.description && <p className="text-sm text-neutral-500">{brand.description}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          basePath={basePath}
          searchParams={rawParams}
          categories={categories}
          brands={[]}
          activeCategorySlug={filters.categorySlug}
        />

        <div className="flex flex-1 flex-col gap-6">
          <ProductGrid products={products} emptyDescription={`No ${brand.name} products yet — check back soon.`} />
          <Pagination basePath={basePath} searchParams={rawParams} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
