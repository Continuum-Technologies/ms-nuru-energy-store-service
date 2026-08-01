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
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";
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
  searchParams?: Promise<{ page?: string }>;
}

export default async function ProductsPage({ searchParams }: Readonly<ProductsPageProps>) {
  await requirePermissionOrRedirect("products.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

  const [products, stats] = await Promise.all([
    db.product.findMany({
      include: { category: { select: { name: true } }, inventoryItem: { select: { quantityOnHand: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getProductStats(),
  ]);

  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryName: product.category.name,
    sellingPrice: Number(product.sellingPrice),
    status: product.status,
    quantityOnHand: product.inventoryItem?.quantityOnHand ?? null,
  }));

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

      <DataList
        page={page}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replaceAll("_", " ")}</Badge>}
        emptyState={
          <EmptyState
            title="No products yet"
            description="Add your first product to start building the catalog."
            action={
              <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
                Add Product
              </Link>
            }
          />
        }
      />
    </div>
  );
}
