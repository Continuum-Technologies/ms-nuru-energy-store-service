"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { homepageBannerSchema } from "@/modules/content/schemas";

type FormState = { error: string } | undefined;

function parseBannerForm(formData: FormData) {
  return homepageBannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    imageKey: formData.get("imageKey") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    ctaHref: formData.get("ctaHref") || undefined,
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "on",
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });
}

export async function createBanner(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("content.manage");

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the banner details." };
  }

  await db.homepageBanner.create({ data: parsed.data });

  revalidatePath("/admin/website");
  revalidatePath("/", "layout");
  redirect("/admin/website");
}

/** Used as `updateBanner.bind(null, banner.id)` so it matches useActionState's `(state, formData)` shape. */
export async function updateBanner(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("content.manage");

  const parsed = parseBannerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the banner details." };
  }

  await db.homepageBanner.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/website");
  revalidatePath("/", "layout");
  redirect("/admin/website");
}

export async function deleteBanner(formData: FormData): Promise<{ error: string } | void> {
  const actor = await requirePermission("content.manage");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing banner id." };
  }

  const banner = await db.homepageBanner.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "content.banner.delete",
      entityType: "HomepageBanner",
      entityId: id,
      previousValue: { title: banner.title, isActive: banner.isActive },
    },
  });

  revalidatePath("/admin/website");
  revalidatePath("/", "layout");
}
