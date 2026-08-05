import Link from "next/link";
import { Plus, FolderTree, Layers, CheckCircle2, EyeOff, FileEdit, ExternalLink } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteCategory } from "@/modules/catalog/categories/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";
import { AdminSearchInput } from "@/app/admin/(dashboard)/_components/admin-search-input";

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

interface CategoriesPageProps {
  searchParams?: Promise<{ page?: string; q?: string }>;
}

export default async function CategoriesPage({ searchParams }: Readonly<CategoriesPageProps>) {
  await requirePermissionOrRedirect("categories.manage");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = (resolvedSearchParams?.q || "").toLowerCase().trim();

  const [categories, stats] = await Promise.all([
    db.category.findMany({
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    getCategoryStats(),
  ]);

  const allRows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentName: category.parent?.name ?? null,
    isActive: category.isActive,
    productCount: category._count.products,
    displayOrder: category.displayOrder,
  }));

  const rows = allRows.filter((row) => {
    if (!searchQuery) return true;
    return (
      row.name.toLowerCase().includes(searchQuery) ||
      row.slug.toLowerCase().includes(searchQuery) ||
      (row.parentName && row.parentName.toLowerCase().includes(searchQuery))
    );
  });

  const columns: DataListColumn<CategoryRow>[] = [
    {
      key: "name",
      header: "Category",
      hideOnMobile: true,
      render: (row) => (
        <Link href={`/admin/categories/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
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
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/categories/${row.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
          <a
            href={`/categories/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1 text-neutral-500 hover:text-brand-600" })}
            title="View category page on storefront"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
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

      {/* Toolbar: Search input */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <AdminSearchInput placeholder="Search 36 categories by name, slug, or parent..." />
      </div>

      <DataList
        page={page}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title={searchQuery ? `No categories match "${searchQuery}"` : "No categories created yet"}
            description={searchQuery ? "Try searching for a different keyword." : "Create your first equipment category to start organizing storefront products."}
            action={
              searchQuery ? (
                <Link href="/admin/categories" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Clear Search
                </Link>
              ) : (
                <Link href="/admin/categories/new" className={buttonVariants({ size: "sm" })}>
                  Add Category
                </Link>
              )
            }
          />
        }
      />
    </div>
  );
}
