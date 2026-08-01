import { z } from "zod";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { kenyanPhoneSchema } from "@/lib/phone";

// Excludes MPESA_STK_PUSH (no real STK integration to trigger yet) and
// MANUAL (an internal/admin-recorded method, never a customer-facing
// choice) from the schema's full PaymentMethod enum — see CLAUDE.md's
// checkout notes.
export const CUSTOMER_PAYMENT_METHODS = [
  "MPESA_TILL",
  "MPESA_PAYBILL",
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "PAYMENT_ON_COLLECTION",
] as const;

export const checkoutSchema = z.object({
  guestName: z.string().min(1, "Full name is required").max(200),
  guestPhone: kenyanPhoneSchema,
  guestEmail: z.email({ message: "Enter a valid email address" }).optional(),
  county: z.enum(KENYA_COUNTIES, { message: "Select a county" }),
  town: z.string().min(1, "Town is required").max(200),
  deliveryLocation: z.string().max(500).optional(),
  deliveryInstructions: z.string().max(1000).optional(),
  paymentMethod: z.enum(CUSTOMER_PAYMENT_METHODS, { message: "Select a payment method" }),
  customerNotes: z.string().max(1000).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Full PaymentMethod enum (unlike checkout's customer-facing subset) — a
// staff-initiated quotation conversion may already know payment happened
// through any real method, not just the ones a customer picks from a form.
export const ALL_PAYMENT_METHODS = [
  "MPESA_STK_PUSH",
  "MPESA_TILL",
  "MPESA_PAYBILL",
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "PAYMENT_ON_COLLECTION",
  "MANUAL",
] as const;

export const convertQuotationSchema = z.object({
  county: z.enum(KENYA_COUNTIES, { message: "Select a county" }),
  town: z.string().min(1, "Town is required").max(200),
  deliveryLocation: z.string().max(500).optional(),
  deliveryInstructions: z.string().max(1000).optional(),
  paymentMethod: z.enum(ALL_PAYMENT_METHODS, { message: "Select a payment method" }),
});
export type ConvertQuotationInput = z.infer<typeof convertQuotationSchema>;

export const ORDER_STATUSES = [
  "NEW",
  "AWAITING_CONFIRMATION",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFICATION_REQUIRED",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_COLLECTION",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

// Cancelling an order releases reserved stock — that only makes physical
// sense before the goods have actually left. Once dispatched/delivered/
// completed (or already cancelled/refunded), a real return-and-restock flow
// is needed instead (deferred to the Inventory Management phase).
export const CANCELLABLE_ORDER_STATUSES = [
  "NEW",
  "AWAITING_CONFIRMATION",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFICATION_REQUIRED",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_COLLECTION",
  "READY_FOR_DISPATCH",
] as const;

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const assignOrderSchema = z.object({
  assignedEmployeeId: z.string().min(1, "Select a staff member"),
});

export const orderInternalNotesSchema = z.object({
  internalNotes: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  paymentId: z.string().min(1),
  providerReference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1),
  partial: z.coerce.boolean().default(false),
  notes: z.string().max(1000).optional(),
});
