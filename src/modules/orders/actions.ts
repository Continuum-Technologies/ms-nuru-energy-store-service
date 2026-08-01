"use server";

import { redirect } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { getCartWithItems } from "@/modules/cart/queries";
import { getOrCreateCustomer } from "@/modules/customers/actions";
import { normalizeKenyanPhone } from "@/lib/phone";
import { checkoutSchema } from "./schemas";
import { generateOrderNumber } from "./order-number";
import { reserveStock } from "@/modules/inventory/reserve-stock";

type FormState = { error: string } | undefined;

function parseCheckoutForm(formData: FormData) {
  return checkoutSchema.safeParse({
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    guestEmail: formData.get("guestEmail") || undefined,
    county: formData.get("county"),
    town: formData.get("town"),
    deliveryLocation: formData.get("deliveryLocation") || undefined,
    deliveryInstructions: formData.get("deliveryInstructions") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    customerNotes: formData.get("customerNotes") || undefined,
  });
}

/**
 * Converts the guest's cart into a real `Order` — the first place in this
 * codebase that writes `InventoryMovement`/`reservedQuantity` (CLAUDE.md §4)
 * and the actual point where product name/price get frozen into an
 * `OrderItem` snapshot (the cart itself never freezes). Payment stays a
 * `PENDING` placeholder row — no real provider integration yet.
 */
export async function submitOrder(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseCheckoutForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  const cart = await getCartWithItems();
  if (cart.items.length === 0 || !cart.id) {
    return { error: "Your cart is empty." };
  }

  // Re-validate every item against current product/inventory state — stock
  // can shift between adding to cart and checking out. Reject the whole
  // submission rather than silently placing a different order than the
  // customer saw.
  for (const item of cart.items) {
    const product = item.product;
    if (product.status !== "ACTIVE" || product.isQuotationOnly || product.hidePrice) {
      return { error: `"${product.name}" is no longer available for direct purchase — please remove it from your cart.` };
    }
    const inv = product.inventoryItem;
    if (inv && !inv.allowBackorder) {
      const available = Math.max(0, inv.quantityOnHand - inv.reservedQuantity);
      if (item.quantity > available) {
        return {
          error:
            available > 0
              ? `Only ${available} unit(s) of "${product.name}" are available — please adjust the quantity in your cart.`
              : `"${product.name}" just went out of stock — please remove it from your cart.`,
        };
      }
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.quantity, 0);

  const orderNumber = await generateOrderNumber(async (candidate) => {
    const existing = await db.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    return existing !== null;
  });

  const cartId = cart.id;

  const order = await db.$transaction(async (tx) => {
    // "Guest checkout" means no login is required — it doesn't mean the
    // customer goes unrecorded. Find-or-create by phone so repeat orders,
    // order history and total spend (PRD §21) have real data to build on;
    // guestName/guestPhone/guestEmail below still capture the order-time
    // snapshot, same as OrderItem's product snapshot.
    const customer = await getOrCreateCustomer(
      {
        name: data.guestName,
        phone: data.guestPhone,
        email: data.guestEmail,
        county: data.county,
        town: data.town,
        deliveryLocation: data.deliveryLocation,
        deliveryInstructions: data.deliveryInstructions,
      },
      tx,
    );

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        guestName: data.guestName,
        guestPhone: normalizeKenyanPhone(data.guestPhone),
        guestEmail: data.guestEmail,
        county: data.county,
        town: data.town,
        deliveryLocation: data.deliveryLocation,
        deliveryInstructions: data.deliveryInstructions,
        customerNotes: data.customerNotes,
        subtotal,
        total: subtotal,
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productSku: item.product.sku,
            unitPrice: item.product.sellingPrice,
            quantity: item.quantity,
            lineTotal: Number(item.product.sellingPrice) * item.quantity,
          })),
        },
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: createdOrder.id, toStatus: "NEW" },
    });

    await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        reference: `${orderNumber}-P1`,
        method: data.paymentMethod,
        amount: subtotal,
        status: "PENDING",
      },
    });

    await reserveStock(
      tx,
      createdOrder.id,
      cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    );

    await tx.cartItem.deleteMany({ where: { cartId } });

    // The Cart row survives (only its items are cleared) so the guest's
    // cookie keeps working for their next visit — but now that checkout has
    // resolved a real Customer, link the two so a future "welcome back"
    // pre-fill or cart-merge-on-login has something to key off.
    await tx.cart.update({ where: { id: cartId }, data: { customerId: customer.id } });

    return createdOrder;
  });

  redirect(`/order-confirmation/${order.id}`);
}
