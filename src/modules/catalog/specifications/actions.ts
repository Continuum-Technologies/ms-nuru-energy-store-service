"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { specificationTemplateSchema, specificationFieldSchema } from "@/modules/catalog/schemas";

type FormState = { error: string } | undefined;

/** Bound with `.bind(null, categoryId)`. Lives on the category edit page (CLAUDE.md §12 — templates are per-category, not a separate nav item). */
export async function createSpecificationTemplate(
  categoryId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("categories.manage");

  const parsed = specificationTemplateSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid template name." };
  }

  await db.specificationTemplate.create({
    data: { name: parsed.data.name, categoryId },
  });

  revalidatePath(`/admin/categories/${categoryId}/edit`);
}

/** Bound with `.bind(null, templateId)`. */
export async function addSpecificationField(
  templateId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("categories.manage");

  const parsed = specificationFieldSchema.safeParse({
    label: formData.get("label"),
    unit: formData.get("unit") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid field." };
  }

  const fieldCount = await db.specificationField.count({ where: { templateId } });

  const field = await db.specificationField.create({
    data: {
      templateId,
      label: parsed.data.label,
      unit: parsed.data.unit,
      displayOrder: fieldCount,
    },
    include: { template: { select: { categoryId: true } } },
  });

  if (field.template.categoryId) {
    revalidatePath(`/admin/categories/${field.template.categoryId}/edit`);
  }
}

export async function deleteSpecificationField(fieldId: string): Promise<void> {
  await requirePermission("categories.manage");

  const field = await db.specificationField.delete({
    where: { id: fieldId },
    include: { template: { select: { categoryId: true } } },
  });

  if (field.template.categoryId) {
    revalidatePath(`/admin/categories/${field.template.categoryId}/edit`);
  }
}

/**
 * Saves the submitted spec values for a product against its category's
 * template fields — one ProductSpecification row per field with a non-empty
 * value; fields left blank are removed rather than saved empty.
 */
export async function saveProductSpecifications(productId: string, formData: FormData): Promise<void> {
  await requirePermission("products.edit");

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  });
  if (!product) return;

  const template = await db.specificationTemplate.findFirst({
    where: { categoryId: product.categoryId },
    include: { fields: true },
  });
  if (!template) return;

  for (const field of template.fields) {
    const value = formData.get(`field:${field.id}`);
    const trimmed = typeof value === "string" ? value.trim() : "";

    if (!trimmed) {
      await db.productSpecification.deleteMany({ where: { productId, fieldId: field.id } });
      continue;
    }

    await db.productSpecification.upsert({
      where: { productId_fieldId: { productId, fieldId: field.id } },
      create: { productId, fieldId: field.id, value: trimmed },
      update: { value: trimmed },
    });
  }

  revalidatePath(`/admin/products/${productId}/edit`);
}
