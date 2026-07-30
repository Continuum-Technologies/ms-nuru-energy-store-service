import { notFound } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { updateBrand } from "@/modules/catalog/brands/actions";
import { BrandForm } from "@/app/admin/(dashboard)/brands/_components/brand-form";

export default async function EditBrandPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  await requirePermissionOrRedirect("brands.manage");

  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });

  if (!brand) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit brand</h1>
        <p className="text-sm text-neutral-500">{brand.name}</p>
      </div>

      <BrandForm
        action={updateBrand.bind(null, brand.id)}
        initialValues={{
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          description: brand.description,
          countryOfOrigin: brand.countryOfOrigin,
          websiteUrl: brand.websiteUrl,
          isActive: brand.isActive,
          isFeatured: brand.isFeatured,
          seoTitle: brand.seoTitle,
          seoDescription: brand.seoDescription,
        }}
      />
    </div>
  );
}
