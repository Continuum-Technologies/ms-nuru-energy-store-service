import Link from "next/link";
import { Plus, Factory, Star, CheckCircle2, Globe, FileEdit, ExternalLink } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteBrand } from "@/modules/catalog/brands/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";
import { AdminSearchInput } from "@/app/admin/(dashboard)/_components/admin-search-input";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  countryOfOrigin: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
}

async function getBrandStats() {
  const [total, featured, active] = await Promise.all([
    db.brand.count(),
    db.brand.count({ where: { isFeatured: true } }),
    db.brand.count({ where: { isActive: true } }),
  ]);
  return { total, featured, active };
}

interface BrandsPageProps {
  searchParams?: Promise<{ page?: string; q?: string }>;
}

export default async function BrandsPage({ searchParams }: Readonly<BrandsPageProps>) {
  await requirePermissionOrRedirect("brands.manage");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = (resolvedSearchParams?.q || "").toLowerCase().trim();

  const [brands, stats] = await Promise.all([
    db.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    getBrandStats(),
  ]);

  const allRows: BrandRow[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    countryOfOrigin: brand.countryOfOrigin,
    websiteUrl: brand.websiteUrl,
    isActive: brand.isActive,
    isFeatured: brand.isFeatured,
    productCount: brand._count.products,
  }));

  const rows = allRows.filter((row) => {
    if (!searchQuery) return true;
    return (
      row.name.toLowerCase().includes(searchQuery) ||
      row.slug.toLowerCase().includes(searchQuery) ||
      (row.countryOfOrigin?.toLowerCase().includes(searchQuery))
    );
  });

  const columns: DataListColumn<BrandRow>[] = [
    {
      key: "name",
      header: "Brand / Manufacturer",
      hideOnMobile: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/brands/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
            {row.name}
          </Link>
          {row.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-bold text-warning-700 dark:bg-warning-600/15 dark:text-warning-200 border border-warning-200/50">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>
      ),
    },
    { key: "slug", header: "Slug", render: (row) => <span className="text-xs font-mono text-neutral-500">{row.slug}</span> },
    {
      key: "origin",
      header: "Country of Origin",
      render: (row) =>
        row.countryOfOrigin ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
            <Globe className="h-3.5 w-3.5 text-neutral-400" />
            {row.countryOfOrigin}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    { key: "products", header: "Catalog Equipment", render: (row) => <span className="font-semibold text-xs">{row.productCount} items</span> },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      render: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/brands/${row.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
          <a
            href={`/brands/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1 text-neutral-500 hover:text-brand-600" })}
            title="View brand page on storefront"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
          <DeleteRowButton action={deleteBrand} id={row.id} label="brand" name={row.name} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Equipment Manufacturers</h1>
          <p className="text-sm text-neutral-500">Manage solar & power equipment brand partners carried in your catalog.</p>
        </div>
        <Link href="/admin/brands/new" className={buttonVariants({ size: "sm", className: "gap-2 font-bold" })}>
          <Plus className="h-4 w-4" />
          Add Brand
        </Link>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard title="Total Brands" value={stats.total} subtitle="Equipment Partners" icon={<Factory className="h-4 w-4 sm:h-5 sm:w-5" />} tone="brand" />
        <KpiCard title="Featured Partners" value={stats.featured} subtitle="Showcased on Homepage" icon={<Star className="h-4 w-4 sm:h-5 sm:w-5" />} tone="warning" />
        <KpiCard title="Active Brands" value={stats.active} subtitle="Filterable on Storefront" icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />} tone="success" />
      </div>

      {/* Toolbar: Search input */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <AdminSearchInput placeholder="Search 46 brands by manufacturer name, slug, or country..." />
      </div>

      <DataList
        page={page}
        searchParams={resolvedSearchParams}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title={searchQuery ? `No manufacturers match "${searchQuery}"` : "No manufacturers added yet"}
            description={searchQuery ? "Try searching for a different manufacturer or brand name." : "Add equipment manufacturers like Must Solar, Sunsynk, or Victron Energy to stock their products."}
            action={
              searchQuery ? (
                <Link href="/admin/brands" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Clear Search
                </Link>
              ) : (
                <Link href="/admin/brands/new" className={buttonVariants({ size: "sm" })}>
                  Add Brand
                </Link>
              )
            }
          />
        }
      />
    </div>
  );
}
