import { z } from "zod";

// Damage/loss/supplier-return/manual release are all corrections — an audit
// log entry that just says "adjusted" with no reason is useless later, so
// `reason` is required (unlike receiving stock, where a PO/delivery note
// reference is the natural "reason" and can be optional free text).
export const stockMovementSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Enter a quantity of at least 1"),
  reason: z.string().min(1, "A reason is required").max(500),
});

export const receiveStockSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Enter a quantity of at least 1"),
  reference: z.string().max(200).optional(),
  reason: z.string().max(500).optional(),
});

export const stockCountSchema = z.object({
  countedQuantity: z.coerce.number().int().min(0, "Enter a counted quantity of 0 or more"),
  reason: z.string().max(500).optional(),
});

export const reorderSettingsSchema = z.object({
  reorderLevel: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  allowBackorder: z.coerce.boolean().default(false),
});

export const manualReleaseSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Enter a quantity of at least 1"),
  reason: z.string().min(1, "A reason is required").max(500),
});
