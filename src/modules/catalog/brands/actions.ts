"use server";

import { redirect } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { generateUniqueSlug } from "@/lib/slug";
import { brandSchema } from "@/modules/catalog/schemas";

type FormState = { error: string } | undefined;

function parseBrandForm(formData: FormData) {
  return brandSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    description: formData.get("description") || undefined,
    countryOfOrigin: formData.get("countryOfOrigin") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    isActive: formData.get("isActive"),
    isFeatured: formData.get("isFeatured"),
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
  });
}

export async function createBrand(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("brands.manage");

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid brand details." };
  }
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.brand.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  await db.brand.create({
    data: {
      name: data.name,
      slug,
      logoUrl: data.logoUrl,
      description: data.description,
      countryOfOrigin: data.countryOfOrigin,
      websiteUrl: data.websiteUrl,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  redirect("/admin/brands");
}

/** Used as `updateBrand.bind(null, brand.id)` so it matches useActionState's `(state, formData)` shape. */
export async function updateBrand(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("brands.manage");

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid brand details." };
  }
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.name, async (candidate) => {
    const existing = await db.brand.findUnique({ where: { slug: candidate } });
    return existing !== null && existing.id !== id;
  });

  await db.brand.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      logoUrl: data.logoUrl,
      description: data.description,
      countryOfOrigin: data.countryOfOrigin,
      websiteUrl: data.websiteUrl,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  redirect("/admin/brands");
}

export async function deleteBrand(formData: FormData): Promise<{ error: string } | void> {
  const actor = await requirePermission("brands.manage");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing brand id." };
  }

  const productCount = await db.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    return { error: `Cannot delete — ${productCount} product(s) still use this brand.` };
  }

  const brand = await db.brand.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "brand.delete",
      entityType: "Brand",
      entityId: id,
      previousValue: { name: brand.name, slug: brand.slug },
    },
  });

  redirect("/admin/brands");
}
