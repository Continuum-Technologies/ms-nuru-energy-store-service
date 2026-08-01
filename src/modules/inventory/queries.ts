import { db } from "@/infrastructure/database/client";

/** Every product, including ones with no `InventoryItem` yet ("Not Tracked" — see CLAUDE.md's inventory notes). No `take` limit for the same reason `InventoryWatchlistWidget` has none: filtering happens in JS while the catalog is small. */
export async function getInventoryList() {
  return db.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      status: true,
      inventoryItem: {
        select: {
          quantityOnHand: true,
          reservedQuantity: true,
          reorderLevel: true,
          lowStockThreshold: true,
          allowBackorder: true,
          lastCountedAt: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

/** Matches `InventoryWatchlistWidget`'s own `quantityOnHand <= reorderLevel` rule exactly, so the dashboard and this list never disagree. */
export async function getInventoryStats() {
  const items = await db.inventoryItem.findMany({ select: { quantityOnHand: true, reorderLevel: true } });
  const totalTracked = items.length;
  const outOfStock = items.filter((item) => item.quantityOnHand <= 0).length;
  const lowStock = items.filter((item) => item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel).length;
  return { totalTracked, outOfStock, lowStock };
}

/** Full detail for the admin inventory item page — item numbers + its complete movement history. */
export async function getInventoryItemDetail(productId: string) {
  const [product, movements] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        inventoryItem: {
          select: {
            id: true,
            quantityOnHand: true,
            reservedQuantity: true,
            reorderLevel: true,
            lowStockThreshold: true,
            allowBackorder: true,
            lastCountedAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    db.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        performedBy: { select: { name: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    }),
  ]);

  if (!product) return null;
  return { product, movements };
}
