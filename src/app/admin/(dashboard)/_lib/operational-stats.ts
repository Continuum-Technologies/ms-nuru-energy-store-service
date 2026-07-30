import { cache } from "react";
import { db } from "@/infrastructure/database/client";

const PENDING_ORDER_STATUSES = [
  "NEW",
  "AWAITING_CONFIRMATION",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFICATION_REQUIRED",
] as const;

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export interface OperationalStats {
  ordersToday: number;
  salesToday: number;
  pendingOrders: number;
  newQuotations: number;
  lowStock: number;
  outOfStock: number;
}

const EMPTY_STATS: OperationalStats = {
  ordersToday: 0,
  salesToday: 0,
  pendingOrders: 0,
  newQuotations: 0,
  lowStock: 0,
  outOfStock: 0,
};

/**
 * Live operational summary backing both the dashboard KPI row and the
 * sidebar/mobile-nav badge counts. Wrapped in React's `cache()` so the layout
 * (which only needs the badge subset, on every `/admin/*` page) and the
 * dashboard page (which needs the full set) share one round trip per request
 * instead of computing the same numbers twice.
 *
 * Low/out-of-stock counts fetch all inventory rows and filter in JS rather
 * than a raw cross-column SQL comparison (`quantityOnHand <= reorderLevel`
 * isn't expressible in a plain Prisma `where`) — fine while the catalog is
 * small, worth a real query once inventory scales up.
 */
export const getOperationalStats = cache(async (): Promise<OperationalStats> => {
  try {
    const [ordersToday, salesTodayAgg, pendingOrders, newQuotations, inventoryItems] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: startOfToday() } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfToday() }, status: { not: "CANCELLED" } },
      }),
      db.order.count({ where: { status: { in: [...PENDING_ORDER_STATUSES] } } }),
      db.quotation.count({ where: { status: "NEW_REQUEST" } }),
      db.inventoryItem.findMany({ select: { quantityOnHand: true, reorderLevel: true } }),
    ]);

    const salesToday = Number(salesTodayAgg._sum.total ?? 0);
    const lowStock = inventoryItems.filter(
      (item) => item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel,
    ).length;
    const outOfStock = inventoryItems.filter((item) => item.quantityOnHand === 0).length;

    return { ordersToday, salesToday, pendingOrders, newQuotations, lowStock, outOfStock };
  } catch {
    return EMPTY_STATS;
  }
});
