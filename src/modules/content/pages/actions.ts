"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { generateUniqueSlug } from "@/lib/slug";
import { pageSchema } from "@/modules/content/schemas";

type FormState = { error: string } | undefined;

function parsePageForm(formData: FormData) {
  return pageSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    body: formData.get("body"),
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    seoKeywords: formData.get("seoKeywords") || undefined,
    canonicalUrl: formData.get("canonicalUrl") || undefined,
  });
}

async function revalidatePublicRoutesForPage(slug: string) {
  revalidatePath("/pages/[slug]", "page");
  revalidatePath("/solutions/[slug]", "page");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath(`/pages/${slug}`);
  revalidatePath(`/solutions/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createPage(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("content.manage");

  const parsed = parsePageForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the page details." };
  }
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.title, async (candidate) => {
    const existing = await db.page.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  const page = await db.page.create({ data: { ...data, slug } });

  await revalidatePublicRoutesForPage(page.slug);
  redirect("/admin/website/pages");
}

/** Used as `updatePage.bind(null, page.id)` so it matches useActionState's `(state, formData)` shape. */
export async function updatePage(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("content.manage");

  const parsed = parsePageForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the page details." };
  }
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.title, async (candidate) => {
    const existing = await db.page.findUnique({ where: { slug: candidate } });
    return existing !== null && existing.id !== id;
  });

  const page = await db.page.update({ where: { id }, data: { ...data, slug } });

  await revalidatePublicRoutesForPage(page.slug);
  redirect("/admin/website/pages");
}

export async function deletePage(formData: FormData): Promise<{ error: string } | void> {
  const actor = await requirePermission("content.manage");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing page id." };
  }

  const page = await db.page.delete({ where: { id } });

  // Deleting a published page is content deletion — audited per CLAUDE.md §4.
  if (page.isPublished) {
    await db.auditLog.create({
      data: {
        actorId: actor.id,
        action: "content.page.delete",
        entityType: "Page",
        entityId: id,
        previousValue: { title: page.title, slug: page.slug, type: page.type },
      },
    });
  }

  await revalidatePublicRoutesForPage(page.slug);
  revalidatePath("/admin/website/pages");
}
