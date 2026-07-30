import Link from "next/link";
import { Plus, FolderTree, Layers, CheckCircle2, EyeOff } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteCategory } from "@/modules/catalog/categories/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  isActive: boolean;
  productCount: number;
  displayOrder: number;
}

async function getCategoryStats() {
  const [total, topLevel, active, hidden] = await Promise.all([
    db.category.count(),
    db.category.count({ where: { parentId: null } }),
    db.category.count({ where: { isActive: true } }),
    db.category.count({ where: { isActive: false } }),
  ]);
  return { total, topLevel, active, hidden };
}

export default async function CategoriesPage() {
  await requirePermissionOrRedirect("categories.manage");

  const [categories, stats] = await Promise.all([
    db.category.findMany({
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    getCategoryStats(),
  ]);

  const rows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentName: category.parent?.name ?? null,
    isActive: category.isActive,
    productCount: category._count.products,
    displayOrder: category.displayOrder,
  }));

  const columns: DataListColumn<CategoryRow>[] = [
    {
      key: "name",
      header: "Category",
      hideOnMobile: true,
      render: (row) => (
        <Link href={`/admin/categories/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", header: "Slug", render: (row) => <span className="text-xs font-mono text-neutral-500">{row.slug}</span> },
    {
      key: "parent",
      header: "Parent Level",
      render: (row) =>
        row.parentName ? (
          <span className="inline-flex items-center gap-1 rounded bg-surface-muted px-2 py-0.5 text-xs text-neutral-600">
            {row.parentName}
          </span>
        ) : (
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Top Level</span>
        ),
    },
    { key: "products", header: "Products", render: (row) => <span className="font-semibold text-xs">{row.productCount} items</span> },
    { key: "order", header: "Display Order", render: (row) => <span className="text-xs text-neutral-500">#{row.displayOrder}</span> },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      render: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/categories/${row.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Edit
          </Link>
          <DeleteRowButton action={deleteCategory} id={row.id} label="category" name={row.name} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Equipment Categories</h1>
          <p className="text-sm text-neutral-500">Organize solar panels, batteries, inverters, and pumps into browsable categories.</p>
        </div>
        <Link href="/admin/categories/new" className={buttonVariants({ size: "sm", className: "gap-2 font-bold" })}>
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard title="Total Categories" value={stats.total} subtitle="All Taxonomies" icon={<FolderTree className="h-4 w-4 sm:h-5 sm:w-5" />} tone="brand" />
        <KpiCard title="Top-Level" value={stats.topLevel} subtitle="Main Equipment Types" icon={<Layers className="h-4 w-4 sm:h-5 sm:w-5" />} tone="brand" />
        <KpiCard title="Active" value={stats.active} subtitle="Visible on Storefront" icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />} tone="success" />
        <KpiCard title="Hidden / Draft" value={stats.hidden} subtitle="Not Published" icon={<EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />} tone="warning" />
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title="No categories created yet"
            description="Create your first equipment category to start organizing storefront products."
            action={
              <Link href="/admin/categories/new" className={buttonVariants({ size: "sm" })}>
                Add Category
              </Link>
            }
          />
        }
      />
    </div>
  );
}
