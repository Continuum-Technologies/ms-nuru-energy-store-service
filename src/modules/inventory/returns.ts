"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";

type FormState = { error: string } | undefined;

const RETURNABLE_ORDER_STATUSES = ["DELIVERED", "COMPLETED"] as const;

/**
 * Processes a customer return against a delivered/completed order —
 * explicitly deferred by Order Management to this phase. Restocks via a
 * `CUSTOMER_RETURN` movement per returned line (capped at that line's
 * original quantity); a custom (non-catalog) line item has nothing to
 * physically restock. Gated by `orders.manage`, same permission as the
 * order detail page's other order-level actions (`cancelOrder`, status
 * changes) — a return is initiated from, and about, a specific order.
 */
export async function processCustomerReturn(orderId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("orders.manage");

  const reason = formData.get("reason");
  if (typeof reason !== "string" || reason.trim().length === 0) {
    return { error: "A reason is required to process a return." };
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Order not found." };

  if (!(RETURNABLE_ORDER_STATUSES as readonly string[]).includes(order.status)) {
    return { error: "Only a delivered or completed order can be returned." };
  }

  const lines: { orderItemId: string; productId: string; productName: string; quantity: number }[] = [];
  for (const item of order.items) {
    const raw = formData.get(`qty_${item.id}`);
    const quantity = typeof raw === "string" ? Number(raw) : 0;
    if (!quantity || quantity <= 0) continue;

    if (quantity > item.quantity) {
      return { error: `Return quantity for "${item.productName}" can't exceed the ${item.quantity} originally ordered.` };
    }
    if (!item.productId) continue; // custom line item — nothing to physically restock

    lines.push({ orderItemId: item.id, productId: item.productId, productName: item.productName, quantity });
  }

  if (lines.length === 0) {
    return { error: "Select at least one item and quantity to return." };
  }

  await db.$transaction(async (tx) => {
    for (const line of lines) {
      const inventoryItem = await tx.inventoryItem.findUnique({ where: { productId: line.productId } });
      if (!inventoryItem) continue;

      const previousQuantity = inventoryItem.quantityOnHand;
      const newQuantity = previousQuantity + line.quantity;

      await tx.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantityOnHand: newQuantity } });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          productId: line.productId,
          type: "CUSTOMER_RETURN",
          quantityChange: line.quantity,
          previousQuantity,
          newQuantity,
          reason,
          orderId,
        },
      });
    }
  });

  revalidatePath(`/admin/orders/${orderId}`);
}
