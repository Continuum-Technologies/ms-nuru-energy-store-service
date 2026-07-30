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
        <h1 className="text-xl font-bold text-foreground">Create Product Category</h1>
        <p className="text-sm text-neutral-500">Add a new equipment category or sub-category to your catalog hierarchy.</p>
      </div>
      <CategoryForm
        action={createCategory}
        parentOptions={parentOptions}
        cancelHref="/admin/categories"
        submitLabel="Create Product Category"
      />
    </div>
  );
}
