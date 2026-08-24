import type { PageType } from "@/generated/prisma/client";

/**
 * Maps a Page row to its public storefront URL — used by the admin "View"
 * link and anywhere a canonical URL needs to be derived. STATIC pages use
 * fixed slugs (see src/app/(storefront)/about, .../contact) rather than a
 * generic /pages/[slug] route, since there are only ever exactly two.
 */
export function publicPathForPage(type: PageType, slug: string): string {
  if (type === "STATIC") {
    if (slug === "about-us") return "/about";
    if (slug === "contact-us") return "/contact";
    return `/pages/${slug}`;
  }
  if (type === "SOLUTION") {
    return `/solutions/${slug}`;
  }
  return `/pages/${slug}`;
}
