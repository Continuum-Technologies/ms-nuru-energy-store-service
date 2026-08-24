import { db } from "@/infrastructure/database/client";
import type { PageType } from "@/generated/prisma/client";

/** Active, in-window banners only, in display order — for the homepage hero. */
export async function getActiveBanners() {
  const now = new Date();
  const banners = await db.homepageBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return banners.filter((banner) => {
    if (banner.startsAt && banner.startsAt > now) return false;
    if (banner.endsAt && banner.endsAt < now) return false;
    return true;
  });
}

/** Published-only — mirrors catalog/queries.ts's `status: "ACTIVE"` guard so a draft page can never leak publicly. */
export async function getPageBySlug(slug: string) {
  const page = await db.page.findUnique({ where: { slug } });
  if (!page?.isPublished) {
    return null;
  }
  return page;
}

export async function getPagesByType(type: PageType) {
  return db.page.findMany({ where: { type }, orderBy: { title: "asc" } });
}

/** Slug + updatedAt only, for sitemap.ts — never more than a published entity should expose. */
export async function getPublishedPageSlugs() {
  return db.page.findMany({ where: { isPublished: true }, select: { slug: true, type: true, updatedAt: true } });
}
