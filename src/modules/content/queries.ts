import { db } from "@/infrastructure/database/client";
import type { PageType } from "@/generated/prisma/client";

/** Active, in-window banners only, in display order — for the homepage hero. */
export async function getActiveBanners() {
  try {
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
  } catch {
    return [];
  }
}

/** Published-only — mirrors catalog/queries.ts's `status: "ACTIVE"` guard so a draft page can never leak publicly. */
export async function getPageBySlug(slug: string) {
  try {
    const page = await db.page.findUnique({ where: { slug } });
    if (!page?.isPublished) {
      return null;
    }
    return page;
  } catch {
    return null;
  }
}

export async function getPagesByType(type: PageType) {
  try {
    return await db.page.findMany({ where: { type }, orderBy: { title: "asc" } });
  } catch {
    return [];
  }
}

/** Slug + updatedAt only, for sitemap.ts — never more than a published entity should expose. */
export async function getPublishedPageSlugs() {
  try {
    return await db.page.findMany({ where: { isPublished: true }, select: { slug: true, type: true, updatedAt: true } });
  } catch {
    return [];
  }
}
