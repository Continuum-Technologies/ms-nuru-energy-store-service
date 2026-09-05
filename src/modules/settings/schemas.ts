import { z } from "zod";

export const storeSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  logoUrl: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  whatsappOrderingEnabled: z.coerce.boolean().default(true),
  email: z.string().email().max(200).optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  county: z.string().max(100).optional(),
  businessHours: z.string().max(200).optional(),
  facebookUrl: z.string().max(500).optional(),
  instagramUrl: z.string().max(500).optional(),
  tiktokUrl: z.string().max(500).optional(),

  currency: z.string().min(1).max(10).default("KES"),
  vatRate: z.coerce.number().min(0).max(100),
  pricesIncludeVat: z.coerce.boolean().default(true),

  deliveryInfo: z.string().max(1000).optional(),
  collectionInfo: z.string().max(1000).optional(),
  warrantyPolicySummary: z.string().max(2000).optional(),
  returnPolicySummary: z.string().max(2000).optional(),
  quotationTermsDefault: z.string().max(4000).optional(),

  orderNotificationEmails: z.string().max(1000).optional(),
  lowStockThresholdDefault: z.coerce.number().int().min(0),

  seoTitleSuffix: z.string().max(100).optional(),
  seoDefaultDescription: z.string().max(300).optional(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const paymentDisplaySettingsSchema = z.object({
  mpesaPaybill: z.string().max(50).optional(),
  mpesaTill: z.string().max(50).optional(),
  bankName: z.string().max(200).optional(),
  bankAccountName: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(100).optional(),
  bankBranch: z.string().max(200).optional(),
});

export type PaymentDisplaySettingsInput = z.infer<typeof paymentDisplaySettingsSchema>;
