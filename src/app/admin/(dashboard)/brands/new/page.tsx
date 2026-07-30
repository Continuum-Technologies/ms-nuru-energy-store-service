import { requirePermissionOrRedirect } from "@/lib/permissions";
import { createBrand } from "@/modules/catalog/brands/actions";
import { BrandForm } from "@/app/admin/(dashboard)/brands/_components/brand-form";

export default async function NewBrandPage() {
  await requirePermissionOrRedirect("brands.manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add brand</h1>
        <p className="text-sm text-neutral-500">Add a new equipment manufacturer.</p>
      </div>
      <BrandForm action={createBrand} />
    </div>
  );
}
