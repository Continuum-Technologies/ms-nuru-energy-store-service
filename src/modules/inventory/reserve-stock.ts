import { db } from "@/infrastructure/database/client";

type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export interface StockReservationLine {
  productId: string;
  quantity: number;
}

/**
 * Reserves stock for each line that has a real `InventoryItem` row — an
 * append-only `InventoryMovement` entry per CLAUDE.md §4. Shared by guest
 * checkout (`submitOrder`) and quotation-to-order conversion
 * (`convertQuotationToOrder`) so both write the identical, already-verified
 * logic rather than a second copy. A line with no inventory row has nothing
 * to reserve — the caller is responsible for checking availability/
 * backorder rules before calling this.
 */
export async function reserveStock(tx: TransactionClient, orderId: string, items: StockReservationLine[]): Promise<void> {
  for (const item of items) {
    const inventoryItem = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
    if (!inventoryItem) continue;

    const previousQuantity = inventoryItem.reservedQuantity;
    const newQuantity = previousQuantity + item.quantity;

    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { reservedQuantity: newQuantity },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId: item.productId,
        type: "ORDER_RESERVATION",
        quantityChange: item.quantity,
        previousQuantity,
        newQuantity,
        orderId,
      },
    });
  }
}
