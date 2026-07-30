"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { generateUniqueSlug } from "@/lib/slug";
import { deleteImage } from "@/infrastructure/storage/upload";
import { productSchema } from "@/modules/catalog/schemas";

type FormState = { error: string } | undefined;

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    sku: formData.get("sku"),
    model: formData.get("model") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    fullDescription: formData.get("fullDescription") || undefined,
    sellingPrice: formData.get("sellingPrice"),
    previousPrice: formData.get("previousPrice") || undefined,
    costPrice: formData.get("costPrice") || undefined,
    isQuotationOnly: formData.get("isQuotationOnly"),
    hidePrice: formData.get("hidePrice"),
    weightKg: formData.get("weightKg") || undefined,
    dimensions: formData.get("dimensions") || undefined,
    installationAvailable: formData.get("installationAvailable"),
    installationRequired: formData.get("installationRequired"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || undefined,
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    seoKeywords: formData.get("seoKeywords") || undefined,
    canonicalUrl: formData.get("canonicalUrl") || undefined,
  });
}

/** Creates the base product, then redirects into edit mode — images, specs and inventory all need a productId to attach to. */
export async function createProduct(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("products.create");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product details." };
  }
  const data = parsed.data;

  const existingSku = await db.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) {
    return { error: `SKU "${data.sku}" is already in use.` };
  }

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.product.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  const product = await db.product.create({
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      model: data.model,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      sellingPrice: data.sellingPrice,
      previousPrice: data.previousPrice,
      costPrice: data.costPrice,
      isQuotationOnly: data.isQuotationOnly,
      hidePrice: data.hidePrice,
      weightKg: data.weightKg,
      dimensions: data.dimensions,
      installationAvailable: data.installationAvailable,
      installationRequired: data.installationRequired,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      canonicalUrl: data.canonicalUrl,
    },
  });

  redirect(`/admin/products/${product.id}/edit`);
}

/** Used as `updateProduct.bind(null, product.id)`. */
export async function updateProduct(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("products.edit");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product details." };
  }
  const data = parsed.data;

  const existingSku = await db.product.findUnique({ where: { sku: data.sku } });
  if (existingSku && existingSku.id !== id) {
    return { error: `SKU "${data.sku}" is already in use.` };
  }

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.product.findUnique({ where: { slug: candidate } });
    return existing !== null && existing.id !== id;
  });

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      sku: data.sku,
      model: data.model,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      sellingPrice: data.sellingPrice,
      previousPrice: data.previousPrice,
      costPrice: data.costPrice,
      isQuotationOnly: data.isQuotationOnly,
      hidePrice: data.hidePrice,
      weightKg: data.weightKg,
      dimensions: data.dimensions,
      installationAvailable: data.installationAvailable,
      installationRequired: data.installationRequired,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      canonicalUrl: data.canonicalUrl,
    },
  });

  redirect(`/admin/products/${id}/edit`);
}

export async function deleteProduct(formData: FormData): Promise<{ error: string } | void> {
  const actor = await requirePermission("products.delete");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing product id." };
  }

  const product = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) {
    return { error: "Product not found." };
  }

  // Best-effort cleanup of the stored image files — the DB rows cascade
  // automatically (ProductImage.onDelete: Cascade) but the RustFS objects don't.
  await Promise.allSettled(product.images.map((image) => deleteImage(image.key)));

  await db.product.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "product.delete",
      entityType: "Product",
      entityId: id,
      previousValue: { name: product.name, sku: product.sku },
    },
  });

  redirect("/admin/products");
}

const publishSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN", "DISCONTINUED", "ARCHIVED"]),
});

/** Bound with `.bind(null, productId)`. Kept separate from updateProduct so every publish/unpublish is audited (CLAUDE.md §4). */
export async function updateProductStatus(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const actor = await requirePermission("products.publish");

  const parsed = publishSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) {
    return { error: "Invalid status." };
  }

  const previous = await db.product.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
  if (!previous) {
    return { error: "Product not found." };
  }

  const isFirstPublish = parsed.data.status === "ACTIVE" && !previous.publishedAt;

  await db.product.update({
    where: { id },
    data: {
      status: parsed.data.status,
      publishedAt: isFirstPublish ? new Date() : undefined,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "product.status_change",
      entityType: "Product",
      entityId: id,
      previousValue: { status: previous.status },
      newValue: { status: parsed.data.status },
    },
  });

  redirect(`/admin/products/${id}/edit`);
}

const inventorySchema = z.object({
  quantityOnHand: z.coerce.number().int().nonnegative(),
  reorderLevel: z.coerce.number().int().nonnegative().default(0),
  lowStockThreshold: z.coerce.number().int().nonnegative().default(0),
  allowBackorder: z.coerce.boolean().default(false),
});

/**
 * Bound with `.bind(null, productId)`. This is a lightweight initial/manual
 * stock-setting path for the catalog module — the dedicated Inventory module
 * (receiving, reservations, damage, etc.) comes later. Every change is still
 * recorded as an InventoryMovement (CLAUDE.md §4) even here.
 */
export async function updateProductInventory(
  productId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("inventory.adjust");

  const parsed = inventorySchema.safeParse({
    quantityOnHand: formData.get("quantityOnHand"),
    reorderLevel: formData.get("reorderLevel"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    allowBackorder: formData.get("allowBackorder"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid inventory details." };
  }
  const data = parsed.data;

  const existing = await db.inventoryItem.findUnique({ where: { productId } });
  const previousQuantity = existing?.quantityOnHand ?? 0;

  const inventoryItem = await db.inventoryItem.upsert({
    where: { productId },
    create: {
      productId,
      quantityOnHand: data.quantityOnHand,
      reorderLevel: data.reorderLevel,
      lowStockThreshold: data.lowStockThreshold,
      allowBackorder: data.allowBackorder,
    },
    update: {
      quantityOnHand: data.quantityOnHand,
      reorderLevel: data.reorderLevel,
      lowStockThreshold: data.lowStockThreshold,
      allowBackorder: data.allowBackorder,
    },
  });

  if (data.quantityOnHand !== previousQuantity) {
    await db.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId,
        type: existing ? "MANUAL_ADJUSTMENT" : "OPENING_STOCK",
        quantityChange: data.quantityOnHand - previousQuantity,
        previousQuantity,
        newQuantity: data.quantityOnHand,
        performedById: actor.id,
      },
    });
  }

  redirect(`/admin/products/${productId}/edit`);
}

/** Called directly from the client after a successful upload to `/api/uploads` (not a form action). */
export async function addProductImage(input: {
  productId: string;
  url: string;
  key: string;
  altText?: string;
}): Promise<void> {
  await requirePermission("products.edit");

  const imageCount = await db.productImage.count({ where: { productId: input.productId } });

  await db.productImage.create({
    data: {
      productId: input.productId,
      url: input.url,
      key: input.key,
      altText: input.altText,
      displayOrder: imageCount,
      isPrimary: imageCount === 0,
    },
  });

  revalidatePath(`/admin/products/${input.productId}/edit`);
}

export async function deleteProductImage(imageId: string): Promise<void> {
  await requirePermission("products.edit");

  const image = await db.productImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await deleteImage(image.key);
  await db.productImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const nextImage = await db.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { displayOrder: "asc" },
    });
    if (nextImage) {
      await db.productImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } });
    }
  }

  revalidatePath(`/admin/products/${image.productId}/edit`);
}

export async function setPrimaryProductImage(imageId: string): Promise<void> {
  await requirePermission("products.edit");

  const image = await db.productImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await db.$transaction([
    db.productImage.updateMany({ where: { productId: image.productId }, data: { isPrimary: false } }),
    db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/admin/products/${image.productId}/edit`);
}
