import Link from "next/link";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { createProduct } from "@/modules/catalog/products/actions";
import { ProductForm } from "@/app/admin/(dashboard)/products/_components/product-form";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default async function NewProductPage() {
  await requirePermissionOrRedirect("products.create");

  const [categories, brands] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Add product</h1>
        <EmptyState
          title="Create a category first"
          description="Every product needs a category — add one before creating products."
          action={
            <Link href="/admin/categories/new" className={buttonVariants({ size: "sm" })}>
              Add Category
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add product</h1>
        <p className="text-sm text-neutral-500">
          Save the basics first — images, specifications and stock are added after.
        </p>
      </div>
      <ProductForm
        action={createProduct}
        categories={categories}
        brands={brands}
        cancelHref="/admin/products"
        submitLabel="Create product"
      />
    </div>
  );
}
