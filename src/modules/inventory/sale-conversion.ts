import { db } from "@/infrastructure/database/client";

type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export interface SaleConversionLine {
  productId: string;
  quantity: number;
}

/**
 * Converts a reservation into a real sale — decrements `quantityOnHand`
 * *and* `reservedQuantity` together, writing one `SALE` movement per line.
 * Until this existed, stock was only ever reserved (Checkout/Quotation
 * conversion); nothing anywhere actually decremented `quantityOnHand`, so
 * "sold" was never really tracked. Called by `updateOrderStatus` the moment
 * an order is marked `DISPATCHED` — that's the point goods physically leave,
 * which is the correct moment for stock to actually be gone (not earlier,
 * not later).
 */
export async function convertReservationToSale(
  tx: TransactionClient,
  orderId: string,
  items: SaleConversionLine[],
): Promise<void> {
  for (const item of items) {
    const inventoryItem = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
    if (!inventoryItem) continue;

    const previousQuantity = inventoryItem.quantityOnHand;
    const newQuantity = Math.max(0, previousQuantity - item.quantity);
    const newReservedQuantity = Math.max(0, inventoryItem.reservedQuantity - item.quantity);

    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantityOnHand: newQuantity, reservedQuantity: newReservedQuantity },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId: item.productId,
        type: "SALE",
        quantityChange: newQuantity - previousQuantity,
        previousQuantity,
        newQuantity,
        orderId,
      },
    });
  }
}
