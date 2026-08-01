"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { getOrCreateCart, getCurrentCart } from "./session";

type ActionResult = { error?: string } | undefined;

/**
 * Adds a product to the guest cart, creating the cart cookie on first use.
 * Quantity is always server-clamped against real availability — the client
 * never decides what's allowed (CLAUDE.md §9's server-side validation rule).
 * A quotation-only/hidden-price/non-ACTIVE product can never be added; those
 * only ever show a "Request Quotation" CTA in the UI.
 */
export async function addToCart(productId: string, requestedQuantity: number): Promise<ActionResult> {
  const cart = await getOrCreateCart();

  const [product, existing] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      select: {
        status: true,
        isQuotationOnly: true,
        hidePrice: true,
        inventoryItem: { select: { quantityOnHand: true, reservedQuantity: true, allowBackorder: true } },
      },
    }),
    db.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } }),
  ]);

  if (!product || product.status !== "ACTIVE" || product.isQuotationOnly || product.hidePrice) {
    return { error: "This product isn't available to add to cart." };
  }

  const item = product.inventoryItem;
  let cap = Infinity;
  if (item && !item.allowBackorder) {
    cap = Math.max(0, item.quantityOnHand - item.reservedQuantity);
    if (cap <= 0) {
      return { error: "This product is currently out of stock." };
    }
  }

  const desiredTotal = (existing?.quantity ?? 0) + Math.max(1, Math.trunc(requestedQuantity));
  const quantity = Math.min(desiredTotal, cap);

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity },
    create: { cartId: cart.id, productId, quantity },
  });

  revalidatePath("/cart");
}

/** Re-clamps against current availability on every change — stock can shift between page load and the customer's click. */
export async function updateCartItemQuantity(itemId: string, requestedQuantity: number): Promise<ActionResult> {
  const cart = await getCurrentCart();
  if (!cart) {
    return { error: "Cart item not found." };
  }

  const item = await db.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    select: {
      product: {
        select: { inventoryItem: { select: { quantityOnHand: true, reservedQuantity: true, allowBackorder: true } } },
      },
    },
  });
  if (!item) {
    return { error: "Cart item not found." };
  }

  const invItem = item.product.inventoryItem;
  let cap = Infinity;
  if (invItem && !invItem.allowBackorder) {
    cap = Math.max(1, invItem.quantityOnHand - invItem.reservedQuantity);
  }

  const quantity = Math.min(Math.max(1, Math.trunc(requestedQuantity)), cap);

  await db.cartItem.updateMany({ where: { id: itemId, cartId: cart.id }, data: { quantity } });
  revalidatePath("/cart");
}

/** Scoped to the caller's own cart via `cartId` in the `where` — a guest can never remove another cart's item by guessing an id. */
export async function removeCartItem(itemId: string): Promise<void> {
  const cart = await getCurrentCart();
  if (!cart) return;

  await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  revalidatePath("/cart");
}
