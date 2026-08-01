import { db } from "@/infrastructure/database/client";
import { getCurrentCart } from "./session";

const CART_ITEM_SELECT = {
  id: true,
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      sellingPrice: true,
      previousPrice: true,
      hidePrice: true,
      isQuotationOnly: true,
      status: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
      inventoryItem: {
        select: { quantityOnHand: true, reservedQuantity: true, lowStockThreshold: true, allowBackorder: true },
      },
    },
  },
} as const;

/**
 * The full cart for the `/cart` page — line items always join the
 * *current* product row (name/price/image/availability), never a frozen
 * snapshot. Freezing only happens at order placement (a later phase);
 * a cart is provisional, so it should always reflect today's price.
 */
export async function getCartWithItems() {
  const cart = await getCurrentCart();
  if (!cart) {
    return { id: null, items: [] };
  }

  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    select: CART_ITEM_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return { id: cart.id, items };
}

/** Lightweight item count for the header badge — `0` when no cart cookie exists yet, without ever creating one. */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCurrentCart();
  if (!cart) return 0;

  const result = await db.cartItem.aggregate({
    where: { cartId: cart.id },
    _sum: { quantity: true },
  });

  return result._sum.quantity ?? 0;
}
