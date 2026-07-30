import { z } from "zod";

// Shared by the create/edit Server Functions (real enforcement) and, where
// used, client-side form validation — one source of truth per CLAUDE.md §9.

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().max(500).optional(),
  parentId: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  seoKeywords: z.string().max(300).optional(),
  canonicalUrl: z.string().max(500).optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  logoUrl: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  countryOfOrigin: z.string().max(100).optional(),
  websiteUrl: z.string().max(500).optional(),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});
export type BrandInput = z.infer<typeof brandSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().min(1, "SKU is required").max(100),
  model: z.string().max(200).optional(),
  shortDescription: z.string().max(500).optional(),
  fullDescription: z.string().max(10000).optional(),

  sellingPrice: z.coerce.number().nonnegative("Selling price must be 0 or more"),
  previousPrice: z.coerce.number().nonnegative().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
  isQuotationOnly: z.coerce.boolean().default(false),
  hidePrice: z.coerce.boolean().default(false),

  weightKg: z.coerce.number().nonnegative().optional(),
  dimensions: z.string().max(200).optional(),
  installationAvailable: z.coerce.boolean().default(false),
  installationRequired: z.coerce.boolean().default(false),

  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),

  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  seoKeywords: z.string().max(300).optional(),
  canonicalUrl: z.string().max(500).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const specificationTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(200),
});
export type SpecificationTemplateInput = z.infer<typeof specificationTemplateSchema>;

export const specificationFieldSchema = z.object({
  label: z.string().min(1, "Label is required").max(200),
  unit: z.string().max(50).optional(),
});
export type SpecificationFieldInput = z.infer<typeof specificationFieldSchema>;
