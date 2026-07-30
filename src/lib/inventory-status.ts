export type AvailabilityStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "AVAILABLE_ON_REQUEST";

export interface InventorySnapshot {
  quantityOnHand: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
}

/**
 * Derives a public-facing availability status from raw stock numbers —
 * the storefront must never render `quantityOnHand`/`reservedQuantity`
 * themselves (CLAUDE.md §4: "availability, not exact stock, is public").
 * A quotation-only product or one with no inventory row at all has nothing
 * to derive from, so it always reads as "available on request".
 */
export function getAvailabilityStatus(
  item: InventorySnapshot | null | undefined,
  isQuotationOnly: boolean,
): AvailabilityStatus {
  if (isQuotationOnly || !item) {
    return "AVAILABLE_ON_REQUEST";
  }

  const available = item.quantityOnHand - item.reservedQuantity;

  if (available <= 0) {
    return item.allowBackorder ? "AVAILABLE_ON_REQUEST" : "OUT_OF_STOCK";
  }
  if (available <= item.lowStockThreshold) {
    return "LOW_STOCK";
  }
  return "IN_STOCK";
}
