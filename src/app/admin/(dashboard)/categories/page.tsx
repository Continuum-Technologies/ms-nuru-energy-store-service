import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteCategory } from "@/modules/catalog/categories/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  isActive: boolean;
  productCount: number;
}

export default async function CategoriesPage() {
  await requirePermissionOrRedirect("categories.manage");

  const categories = await db.category.findMany({
    include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  const rows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentName: category.parent?.name ?? null,
    isActive: category.isActive,
    productCount: category._count.products,
  }));

  const columns: DataListColumn<CategoryRow>[] = [
    {
      key: "name",
      header: "Category",
      hideOnMobile: true,
      render: (row) => (
        <Link href={`/admin/categories/${row.id}/edit`} className="font-medium text-foreground hover:text-brand-600">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", header: "Slug", render: (row) => <span className="text-neutral-500">{row.slug}</span> },
    { key: "parent", header: "Parent", render: (row) => row.parentName ?? "—" },
    { key: "products", header: "Products", render: (row) => row.productCount },
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
          <h1 className="text-xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-neutral-500">Organize equipment into browsable categories.</p>
        </div>
        <Link href="/admin/categories/new" className={buttonVariants({ size: "sm", className: "gap-2" })}>
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title="No categories yet"
            description="Create your first category to start organizing products."
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
