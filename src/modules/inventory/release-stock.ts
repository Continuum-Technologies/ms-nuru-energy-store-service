import { db } from "@/infrastructure/database/client";

type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export interface StockReleaseLine {
  productId: string;
  quantity: number;
}

/**
 * The inverse of `reserveStock` — decrements `InventoryItem.reservedQuantity`
 * and writes an append-only `InventoryMovement` (`ORDER_CANCELLATION`,
 * CLAUDE.md §4) per line that has a real inventory row. Only called from
 * `cancelOrder`, and only for pre-dispatch orders — releasing stock for
 * something already shipped makes no physical sense (that's what
 * `processCustomerReturn` is for instead).
 */
export async function releaseStock(tx: TransactionClient, orderId: string, items: StockReleaseLine[]): Promise<void> {
  for (const item of items) {
    const inventoryItem = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
    if (!inventoryItem) continue;

    const previousQuantity = inventoryItem.reservedQuantity;
    const newQuantity = Math.max(0, previousQuantity - item.quantity);

    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { reservedQuantity: newQuantity },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId: item.productId,
        type: "ORDER_CANCELLATION",
        quantityChange: newQuantity - previousQuantity,
        previousQuantity,
        newQuantity,
        orderId,
      },
    });
  }
}
