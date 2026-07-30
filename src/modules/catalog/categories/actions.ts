"use server";

import { redirect } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { generateUniqueSlug } from "@/lib/slug";
import { categorySchema } from "@/modules/catalog/schemas";

type FormState = { error: string } | undefined;

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    parentId: formData.get("parentId") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    isActive: formData.get("isActive"),
    isFeatured: formData.get("isFeatured"),
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    seoKeywords: formData.get("seoKeywords") || undefined,
    canonicalUrl: formData.get("canonicalUrl") || undefined,
  });
}

/** Bound with `.bind(null, undefined)` isn't needed here — used directly as a form action for /admin/categories/new. */
export async function createCategory(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("categories.manage");

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category details." };
  }
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.category.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  await db.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parentId: data.parentId || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      canonicalUrl: data.canonicalUrl,
    },
  });

  redirect("/admin/categories");
}

/** Used as `updateCategory.bind(null, category.id)` so it matches useActionState's `(state, formData)` shape. */
export async function updateCategory(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("categories.manage");

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category details." };
  }
  const data = parsed.data;

  if (data.parentId === id) {
    return { error: "A category cannot be its own parent." };
  }

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.category.findUnique({ where: { slug: candidate } });
    return existing !== null && existing.id !== id;
  });

  await db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parentId: data.parentId || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      canonicalUrl: data.canonicalUrl,
    },
  });

  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<{ error: string } | void> {
  const actor = await requirePermission("categories.manage");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing category id." };
  }

  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: `Cannot delete — ${productCount} product(s) still use this category.` };
  }

  const category = await db.category.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "category.delete",
      entityType: "Category",
      entityId: id,
      previousValue: { name: category.name, slug: category.slug },
    },
  });

  redirect("/admin/categories");
}
