import type { Metadata } from "next";
import { getStoreSettings } from "@/modules/settings/queries";

interface PageSeoFields {
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
}

/** Falls back to StoreSettings' site-wide SEO defaults when a page has no override of its own. */
export async function buildPageMetadata(page: PageSeoFields, canonicalPath: string): Promise<Metadata> {
  const settings = await getStoreSettings();
  const suffix = settings.seoTitleSuffix ? ` ${settings.seoTitleSuffix}` : "";

  return {
    title: page.seoTitle || `${page.title}${suffix}`,
    description: page.seoDescription || settings.seoDefaultDescription || undefined,
    keywords: page.seoKeywords || undefined,
    alternates: { canonical: page.canonicalUrl || canonicalPath },
  };
}
