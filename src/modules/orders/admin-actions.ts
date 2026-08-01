"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { releaseStock } from "@/modules/inventory/release-stock";
import { convertReservationToSale } from "@/modules/inventory/sale-conversion";
import {
  orderStatusSchema,
  assignOrderSchema,
  orderInternalNotesSchema,
  recordPaymentSchema,
  refundPaymentSchema,
  CANCELLABLE_ORDER_STATUSES,
} from "./schemas";

type FormState = { error: string } | undefined;

/**
 * Writes a real `OrderStatusHistory` row alongside the field update, so the
 * timeline reflects actual transitions, not just the current value. Moving
 * *into* `DISPATCHED` for the first time also converts reserved stock into
 * a real `SALE` — that's the point goods physically leave, which is the
 * first time `quantityOnHand` should actually drop (see
 * `convertReservationToSale`). Re-selecting `DISPATCHED` again (or any other
 * transition) never re-fires it.
 */
export async function updateOrderStatus(orderId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("orders.manage");

  const parsed = orderStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) {
    return { error: "Select a valid status." };
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Order not found." };

  const isFirstDispatch = parsed.data.status === "DISPATCHED" && order.status !== "DISPATCHED";

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: parsed.data.status } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: parsed.data.status, changedById: staff.id },
    });

    if (isFirstDispatch) {
      await convertReservationToSale(
        tx,
        orderId,
        order.items.filter((item) => item.productId).map((item) => ({ productId: item.productId!, quantity: item.quantity })),
      );
    }
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function assignOrder(orderId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("orders.manage");

  const parsed = assignOrderSchema.safeParse({ assignedEmployeeId: formData.get("assignedEmployeeId") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Select a staff member." };
  }

  await db.order.update({ where: { id: orderId }, data: { assignedEmployeeId: parsed.data.assignedEmployeeId } });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderInternalNotes(
  orderId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("orders.manage");

  const parsed = orderInternalNotesSchema.safeParse({ internalNotes: formData.get("internalNotes") || undefined });
  if (!parsed.success) {
    return { error: "Please check the notes and try again." };
  }

  await db.order.update({ where: { id: orderId }, data: { internalNotes: parsed.data.internalNotes } });
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Updates an existing `Payment` row — never creates a new one; checkout/quotation-conversion already created it. */
export async function recordPayment(orderId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("orders.manage");

  const parsed = recordPaymentSchema.safeParse({
    paymentId: formData.get("paymentId"),
    providerReference: formData.get("providerReference") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please check the payment details and try again." };
  }
  const data = parsed.data;

  const payment = await db.payment.findFirst({ where: { id: data.paymentId, orderId } });
  if (!payment) return { error: "Payment record not found." };

  const now = new Date();
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESSFUL",
      providerReference: data.providerReference,
      notes: data.notes,
      paidAt: payment.paidAt ?? now,
      verifiedAt: now,
      recordedById: staff.id,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

/**
 * Record-keeping only — marks the `Payment` refunded/partially-refunded
 * with a note. No real money movement happens here (no gateway to move it
 * through yet); the actual refund is arranged by staff outside the system
 * and just logged here.
 */
export async function processRefund(orderId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("orders.refund");

  const parsed = refundPaymentSchema.safeParse({
    paymentId: formData.get("paymentId"),
    partial: formData.get("partial") === "on",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please check the refund details and try again." };
  }
  const data = parsed.data;

  const payment = await db.payment.findFirst({ where: { id: data.paymentId, orderId } });
  if (!payment) return { error: "Payment record not found." };

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: data.partial ? "PARTIALLY_REFUNDED" : "REFUNDED",
      notes: data.notes,
      recordedById: staff.id,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

/**
 * Cancels a pre-dispatch order and releases its reserved stock. Guarded
 * server-side (never trust that the UI hid the button): only allowed while
 * the order hasn't shipped yet — a dispatched/delivered/completed order
 * needs the (deferred) returns flow instead, not a stock-releasing cancel.
 */
export async function cancelOrder(orderId: string): Promise<{ error?: string } | undefined> {
  const staff = await requirePermission("orders.cancel");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };

  if (!(CANCELLABLE_ORDER_STATUSES as readonly string[]).includes(order.status)) {
    return { error: "This order can no longer be cancelled from here — it has already shipped or is already resolved." };
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: "CANCELLED", changedById: staff.id },
    });

    await releaseStock(
      tx,
      orderId,
      order.items.filter((item) => item.productId).map((item) => ({ productId: item.productId!, quantity: item.quantity })),
    );
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
