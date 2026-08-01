import { z } from "zod";
import { kenyanPhoneSchema } from "@/lib/phone";

export const QUOTATION_STATUSES = [
  "NEW_REQUEST",
  "UNDER_REVIEW",
  "MORE_INFO_REQUIRED",
  "SITE_ASSESSMENT_REQUIRED",
  "PREPARING_QUOTATION",
  "QUOTATION_SENT",
  "CUSTOMER_REVIEWING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED_TO_ORDER",
  "CANCELLED",
] as const;

// Terminal statuses — once reached, the quotation is locked against further
// edits/status changes (decision 11 of the quotations plan).
export const TERMINAL_QUOTATION_STATUSES = ["CONVERTED_TO_ORDER", "CANCELLED"] as const;

export const quotationRequestSchema = z.object({
  guestName: z.string().min(1, "Full name is required").max(200),
  guestPhone: kenyanPhoneSchema,
  guestEmail: z.email({ message: "Enter a valid email address" }).optional(),
  productInterest: z.string().max(300).optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  intendedUse: z.string().max(300).optional(),
  propertyType: z.string().max(200).optional(),
  currentPowerSource: z.string().max(200).optional(),
  installationRequired: z.coerce.boolean().default(false),
  budgetRange: z.string().max(200).optional(),
  preferredCompletionDate: z.string().optional(),
  customerNotes: z.string().max(1000).optional(),
});
export type QuotationRequestInput = z.infer<typeof quotationRequestSchema>;

export const quotationLineItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(300),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const quotationChargesSchema = z.object({
  discountTotal: z.coerce.number().min(0).default(0),
  installationCharge: z.coerce.number().min(0).default(0),
  deliveryCharge: z.coerce.number().min(0).default(0),
  taxTotal: z.coerce.number().min(0).default(0),
});

export const quotationTermsSchema = z.object({
  termsAndConditions: z.string().max(3000).optional(),
  paymentTerms: z.string().max(1000).optional(),
  warrantyInfo: z.string().max(1000).optional(),
  expiresAt: z.string().optional(),
});

export const quotationStatusSchema = z.object({
  status: z.enum(QUOTATION_STATUSES),
});
