import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Excludes admin, auth, API and not-yet-public cart/checkout/account routes from indexing (CLAUDE.md §10). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/auth", "/cart", "/checkout", "/account"],
    },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
