import { z } from "zod";

export const PAGE_TYPES = ["STATIC", "POLICY", "SOLUTION"] as const;

export const homepageBannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(300).optional(),
  imageUrl: z.string().max(500).optional(),
  imageKey: z.string().max(500).optional(),
  ctaLabel: z.string().max(100).optional(),
  ctaHref: z.string().max(300).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});
export type HomepageBannerInput = z.infer<typeof homepageBannerSchema>;

export const pageSchema = z.object({
  type: z.enum(PAGE_TYPES),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  body: z.string().min(1, "Content body is required").max(20000),
  isPublished: z.coerce.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  seoKeywords: z.string().max(300).optional(),
  canonicalUrl: z.string().max(500).optional(),
});
export type PageInput = z.infer<typeof pageSchema>;
