import type { MetadataRoute } from "next";
import { getPublishedProductSlugs, getActiveCategorySlugs, getActiveBrandSlugs } from "@/modules/catalog/queries";
import { env } from "@/lib/env";

// Without this, sitemap.ts has no request-time API call so Next.js treats it
// as statically renderable and executes it once at `next build` — freezing
// the sitemap until the next deploy and requiring a real DB connection at
// build time. force-dynamic makes it render per-request as the comment below
// always intended (CLAUDE.md §10: "Sitemaps regenerate when public content changes").
export const dynamic = "force-dynamic";

/** Regenerated on every request from live, published-only data — never a static list (CLAUDE.md §10). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    getPublishedProductSlugs(),
    getActiveCategorySlugs(),
    getActiveBrandSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: env.SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${env.SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${env.SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${env.SITE_URL}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${env.SITE_URL}/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
