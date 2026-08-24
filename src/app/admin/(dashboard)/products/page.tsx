import Link from "next/link";
import { Plus, Package, FileEdit, CheckCircle2, PackageX, ExternalLink, X } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteProduct } from "@/modules/catalog/products/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatKes } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";
import { AdminSearchInput } from "@/app/admin/(dashboard)/_components/admin-search-input";
import { AdminFilterSelect } from "@/app/admin/(dashboard)/_components/admin-filter-select";
import type { ProductStatus } from "@/generated/prisma/client";

const STATUS_TONE: Record<ProductStatus, "success" | "neutral" | "warning" | "danger"> = {
  ACTIVE: "success",
  DRAFT: "neutral",
  HIDDEN: "neutral",
  AVAILABLE_ON_ORDER: "warning",
  OUT_OF_STOCK: "danger",
  DISCONTINUED: "danger",
  ARCHIVED: "neutral",
};

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  brandId: string | null;
  brandName: string | null;
  brandSlug: string | null;
  sellingPrice: number;
  status: ProductStatus;
  quantityOnHand: number | null;
}

async function getProductStats() {
  const [total, draft, active, outOfStock] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "DRAFT" } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { inventoryItem: { quantityOnHand: 0 } } }),
  ]);
  return { total, draft, active, outOfStock };
}

interface ProductsPageProps {
  searchParams?: Promise<{
    page?: string;
    status?: string;
    category?: string;
    brand?: string;
    q?: string;
  }>;
}

type ProductStatusFilter = "all" | "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

const STATUS_FILTERS: { id: ProductStatusFilter; label: string }[] = [
  { id: "all", label: "All Products" },
  { id: "DRAFT", label: "Drafts" },
  { id: "ACTIVE", label: "Active" },
  { id: "OUT_OF_STOCK", label: "Out of Stock" },
  { id: "DISCONTINUED", label: "Discontinued" },
];

function buildStatusFilterHref(
  statusId: ProductStatusFilter,
  currentParams?: { category?: string; brand?: string; q?: string },
): string {
  const params = new URLSearchParams();
  if (statusId !== "all") {
    params.set("status", statusId);
  }
  if (currentParams?.category && currentParams.category !== "all") {
    params.set("category", currentParams.category);
  }
  if (currentParams?.brand && currentParams.brand !== "all") {
    params.set("brand", currentParams.brand);
  }
  if (currentParams?.q) {
    params.set("q", currentParams.q);
  }
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

export default async function ProductsPage({ searchParams }: Readonly<ProductsPageProps>) {
  await requirePermissionOrRedirect("products.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const activeStatus = (resolvedSearchParams?.status as ProductStatusFilter) || "all";
  const categoryFilter = resolvedSearchParams?.category || "all";
  const brandFilter = resolvedSearchParams?.brand || "all";
  const searchQuery = (resolvedSearchParams?.q || "").toLowerCase().trim();

  const [products, categories, brands, stats] = await Promise.all([
    db.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        inventoryItem: { select: { quantityOnHand: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db.brand.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    getProductStats(),
  ]);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const brandOptions = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const allRows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.category.id,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    brandId: product.brand?.id ?? null,
    brandName: product.brand?.name ?? null,
    brandSlug: product.brand?.slug ?? null,
    sellingPrice: Number(product.sellingPrice),
    status: product.status,
    quantityOnHand: product.inventoryItem?.quantityOnHand ?? null,
  }));

  // Filter products by search query, status tab, category, and brand
  const rows = allRows.filter((row) => {
    const matchesStatus =
      activeStatus === "all" ||
      (activeStatus === "OUT_OF_STOCK" ? row.quantityOnHand === 0 : row.status === activeStatus);

    const matchesCategory =
      categoryFilter === "all" ||
      row.categoryId === categoryFilter ||
      row.categorySlug === categoryFilter;

    const matchesBrand =
      brandFilter === "all" ||
      (row.brandId && (row.brandId === brandFilter || row.brandSlug === brandFilter));

    const matchesSearch =
      !searchQuery ||
      row.name.toLowerCase().includes(searchQuery) ||
      row.sku.toLowerCase().includes(searchQuery) ||
      row.categoryName.toLowerCase().includes(searchQuery) ||
      (row.brandName && row.brandName.toLowerCase().includes(searchQuery)) ||
      row.status.toLowerCase().includes(searchQuery);

    return matchesStatus && matchesCategory && matchesBrand && matchesSearch;
  });

  const hasActiveFilters =
    activeStatus !== "all" || categoryFilter !== "all" || brandFilter !== "all" || searchQuery !== "";

  const columns: DataListColumn<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link href={`/admin/products/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
            {row.name}
          </Link>
          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px] md:hidden">
            <span>SKU: {row.sku}</span>
            {row.brandName && (
              <>
                <span>•</span>
                <span className="font-sans font-medium text-neutral-600 dark:text-neutral-300">{row.brandName}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      hideOnMobile: true,
      render: (row) => <span className="text-neutral-500 font-mono text-xs">{row.sku}</span>,
    },
    {
      key: "brand",
      header: "Brand",
      render: (row) =>
        row.brandName ? (
          <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {row.brandName}
          </span>
        ) : (
          <span className="text-neutral-400 text-xs">—</span>
        ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => <span className="text-xs text-neutral-600 dark:text-neutral-400">{row.categoryName}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (row) => <span className="font-mono font-bold text-foreground text-xs">{formatKes(row.sellingPrice)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) =>
        row.quantityOnHand === null ? (
          <span className="text-neutral-400 text-xs">—</span>
        ) : (
          <span className={`font-mono text-xs font-medium ${row.quantityOnHand === 0 ? "text-danger-700 dark:text-danger-400 font-bold" : "text-foreground"}`}>
            {row.quantityOnHand}
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replaceAll("_", " ")}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/products/${row.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
          <a
            href={`/products/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1 text-neutral-500 hover:text-brand-600" })}
            title="View product page on storefront"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
          <DeleteRowButton action={deleteProduct} id={row.id} label="product" name={row.name} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-neutral-500">Manage solar panels, batteries, inverters, generators and equipment.</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm", className: "gap-2 font-bold shadow-2xs" })}>
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard title="Total Products" value={stats.total} subtitle="All Statuses" icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />} tone="brand" />
        <KpiCard title="Draft" value={stats.draft} subtitle="Not Published" icon={<FileEdit className="h-4 w-4 sm:h-5 sm:w-5" />} tone="warning" />
        <KpiCard title="Active" value={stats.active} subtitle="Live on Storefront" icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />} tone="success" />
        <KpiCard title="Out of Stock" value={stats.outOfStock} subtitle={stats.outOfStock > 0 ? "Replenish Now" : "All Available"} icon={<PackageX className="h-4 w-4 sm:h-5 sm:w-5" />} tone="danger" />
      </div>

      {/* Toolbar: Search input, Category & Brand Dropdown Filters, and Status Tabs */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface/70 p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <AdminSearchInput
              placeholder={`Search ${products.length} products by name, SKU, brand...`}
              className="w-full sm:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <AdminFilterSelect
                paramName="category"
                allLabel="All Categories"
                options={categoryOptions}
                className="w-full sm:w-44"
              />
              <AdminFilterSelect
                paramName="brand"
                allLabel="All Brands"
                options={brandOptions}
                className="w-full sm:w-36"
              />
            </div>
            {hasActiveFilters && (
              <Link
                href="/admin/products"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "h-9 px-2 text-xs text-neutral-500 hover:text-foreground gap-1 shrink-0",
                })}
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Link>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pt-1 lg:pt-0">
            {STATUS_FILTERS.map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={buildStatusFilterHref(tab.id, {
                    category: categoryFilter,
                    brand: brandFilter,
                    q: searchQuery,
                  })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-brand-600 text-brand-50 shadow-2xs dark:bg-brand-500"
                      : "bg-surface-muted text-neutral-600 hover:bg-neutral-200/70 hover:text-foreground dark:text-neutral-300 dark:hover:bg-neutral-800",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <DataList
        page={page}
        searchParams={resolvedSearchParams}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replaceAll("_", " ")}</Badge>}
        emptyState={
          <EmptyState
            title={hasActiveFilters ? "No products match current filters" : "No products yet"}
            description={hasActiveFilters ? "Try clearing or changing your search keywords, category, brand, or status filter." : "Add your first product to start building the catalog."}
            action={
              hasActiveFilters ? (
                <Link href="/admin/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Clear All Filters
                </Link>
              ) : (
                <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
                  Add Product
                </Link>
              )
            }
          />
        }
      />
    </div>
  );
}
