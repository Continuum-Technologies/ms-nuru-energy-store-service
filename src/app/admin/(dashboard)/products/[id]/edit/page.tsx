import { notFound } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { updateProduct } from "@/modules/catalog/products/actions";
import { saveProductSpecifications } from "@/modules/catalog/specifications/actions";
import { ProductForm } from "@/app/admin/(dashboard)/products/_components/product-form";
import { InventorySection } from "@/app/admin/(dashboard)/products/_components/inventory-section";
import { ImagesSection } from "@/app/admin/(dashboard)/products/_components/images-section";
import { SpecificationsSection } from "@/app/admin/(dashboard)/products/_components/specifications-section";
import { PublishingSection } from "@/app/admin/(dashboard)/products/_components/publishing-section";

export default async function EditProductPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  // Gated on products.edit (not just products.view) — this page shows cost
  // price, which per CLAUDE.md §3 shouldn't be visible to e.g. Inventory
  // staff (products.view only), not just hidden from them in the UI.
  await requirePermissionOrRedirect("products.edit");

  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        inventoryItem: true,
        specifications: true,
        category: {
          include: {
            specificationTemplates: {
              include: { fields: { orderBy: { displayOrder: "asc" } } },
            },
          },
        },
      },
    }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  const specTemplate = product.category.specificationTemplates[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit product</h1>
        <p className="text-sm text-neutral-500">{product.name}</p>
      </div>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        brands={brands}
        cancelHref="/admin/products"
        initialValues={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          model: product.model,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          categoryId: product.categoryId,
          brandId: product.brandId,
          sellingPrice: Number(product.sellingPrice),
          previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
          costPrice: product.costPrice ? Number(product.costPrice) : null,
          isQuotationOnly: product.isQuotationOnly,
          hidePrice: product.hidePrice,
          weightKg: product.weightKg ? Number(product.weightKg) : null,
          dimensions: product.dimensions,
          installationAvailable: product.installationAvailable,
          installationRequired: product.installationRequired,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          seoKeywords: product.seoKeywords,
          canonicalUrl: product.canonicalUrl,
        }}
      />

      <InventorySection
        productId={product.id}
        initialValues={
          product.inventoryItem
            ? {
                quantityOnHand: product.inventoryItem.quantityOnHand,
                reorderLevel: product.inventoryItem.reorderLevel,
                lowStockThreshold: product.inventoryItem.lowStockThreshold,
                allowBackorder: product.inventoryItem.allowBackorder,
              }
            : undefined
        }
      />

      <ImagesSection
        productId={product.id}
        images={product.images.map((image) => ({
          id: image.id,
          url: image.url,
          altText: image.altText,
          isPrimary: image.isPrimary,
        }))}
      />

      <SpecificationsSection
        action={saveProductSpecifications.bind(null, product.id)}
        categoryName={product.category.name}
        categoryEditHref={`/admin/categories/${product.categoryId}/edit`}
        fields={specTemplate?.fields ?? []}
        existingValues={product.specifications.map((spec) => ({ fieldId: spec.fieldId, value: spec.value }))}
      />

      <PublishingSection productId={product.id} status={product.status} publishedAt={product.publishedAt} />
    </div>
  );
}
