import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { createCategory } from "@/modules/catalog/categories/actions";
import { CategoryForm } from "@/app/admin/(dashboard)/categories/_components/category-form";

export default async function NewCategoryPage() {
  await requirePermissionOrRedirect("categories.manage");

  const parentOptions = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add category</h1>
        <p className="text-sm text-neutral-500">Create a new product category.</p>
      </div>
      <CategoryForm action={createCategory} parentOptions={parentOptions} />
    </div>
  );
}
