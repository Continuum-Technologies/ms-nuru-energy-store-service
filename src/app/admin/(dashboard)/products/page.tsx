import Link from "next/link";
import { Plus, Package, FileEdit, CheckCircle2, PackageX, ExternalLink } from "lucide-react";
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
  categoryName: string;
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
  searchParams?: Promise<{ page?: string; status?: string; q?: string }>;
}

type ProductStatusFilter = "all" | "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

const STATUS_FILTERS: { id: ProductStatusFilter; label: string }[] = [
  { id: "all", label: "All Products" },
  { id: "DRAFT", label: "Drafts" },
  { id: "ACTIVE", label: "Active" },
  { id: "OUT_OF_STOCK", label: "Out of Stock" },
  { id: "DISCONTINUED", label: "Discontinued" },
];

export default async function ProductsPage({ searchParams }: Readonly<ProductsPageProps>) {
  await requirePermissionOrRedirect("products.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const activeStatus = (resolvedSearchParams?.status as ProductStatusFilter) || "all";
  const searchQuery = (resolvedSearchParams?.q || "").toLowerCase().trim();

  const [products, stats] = await Promise.all([
    db.product.findMany({
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        inventoryItem: { select: { quantityOnHand: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getProductStats(),
  ]);

  const allRows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryName: product.category.name,
    sellingPrice: Number(product.sellingPrice),
    status: product.status,
    quantityOnHand: product.inventoryItem?.quantityOnHand ?? null,
  }));

  // Filter products by search query and active status tab
  const rows = allRows.filter((row) => {
    const matchesStatus =
      activeStatus === "all" ||
      (activeStatus === "OUT_OF_STOCK" ? row.quantityOnHand === 0 : row.status === activeStatus);

    const matchesSearch =
      !searchQuery ||
      row.name.toLowerCase().includes(searchQuery) ||
      row.sku.toLowerCase().includes(searchQuery) ||
      row.categoryName.toLowerCase().includes(searchQuery) ||
      row.status.toLowerCase().includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const columns: DataListColumn<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      hideOnMobile: true,
      render: (row) => (
        <Link href={`/admin/products/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
          {row.name}
        </Link>
      ),
    },
    { key: "sku", header: "SKU", render: (row) => <span className="text-neutral-500 font-mono text-xs">{row.sku}</span> },
    { key: "category", header: "Category", render: (row) => row.categoryName },
    { key: "price", header: "Price", render: (row) => <span className="font-mono font-bold text-foreground">{formatKes(row.sellingPrice)}</span> },
    { key: "stock", header: "Stock", render: (row) => (row.quantityOnHand === null ? "—" : row.quantityOnHand) },
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
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm", className: "gap-2" })}>
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

      {/* Toolbar: Search input and Status filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <AdminSearchInput placeholder="Search 127 products by name, SKU, or category..." />

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/products${tab.id === "all" ? (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "") : `?status=${tab.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm dark:bg-brand-500"
                    : "bg-surface-muted text-neutral-600 hover:bg-surface-muted/80 dark:text-neutral-300",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <DataList
        page={page}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replaceAll("_", " ")}</Badge>}
        emptyState={
          <EmptyState
            title={searchQuery ? `No products match "${searchQuery}"` : "No products yet"}
            description={searchQuery ? "Try searching for a different keyword or SKU." : "Add your first product to start building the catalog."}
            action={
              searchQuery ? (
                <Link href="/admin/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Clear Search
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
