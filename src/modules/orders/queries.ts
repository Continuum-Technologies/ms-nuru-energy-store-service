import { db } from "@/infrastructure/database/client";

/**
 * Keyed by the order's `id` (cuid), not the short human `orderNumber` — with
 * no customer accounts yet, the cuid is the de facto capability token
 * granting view access. No auth check by design; an accepted v1 tradeoff
 * (see CLAUDE.md's checkout notes) to revisit once customer accounts exist.
 */
export async function getOrderConfirmation(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { select: { method: true, status: true, amount: true } },
    },
  });
}

/** Admin order statistics for KPI summary strip. */
export async function getOrderStats() {
  const [totalCount, pendingCount, processingCount, completedCount, totalRevenueAgg] = await Promise.all([
    db.order.count(),
    db.order.count({
      where: {
        status: {
          in: ["NEW", "AWAITING_CONFIRMATION", "AWAITING_PAYMENT", "PAYMENT_VERIFICATION_REQUIRED"],
        },
      },
    }),
    db.order.count({
      where: {
        status: {
          in: ["PAID", "CONFIRMED", "PROCESSING", "READY_FOR_COLLECTION", "READY_FOR_DISPATCH", "DISPATCHED"],
        },
      },
    }),
    db.order.count({
      where: {
        status: {
          in: ["DELIVERED", "COMPLETED"],
        },
      },
    }),
    db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
    }),
  ]);

  return {
    totalCount,
    pendingCount,
    processingCount,
    completedCount,
    totalRevenue: Number(totalRevenueAgg._sum.total ?? 0),
  };
}

/** Admin list page — every order regardless of status (staff-only view, unlike the storefront's published-only catalog queries). */
export async function getOrdersList() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      guestName: true,
      guestPhone: true,
      guestEmail: true,
      county: true,
      town: true,
      total: true,
      createdAt: true,
      customer: { select: { id: true, name: true, phone: true, email: true } },
      assignedEmployee: { select: { id: true, name: true } },
      quotation: { select: { id: true, quotationNumber: true } },
      items: { select: { id: true } },
      payments: { select: { status: true, method: true, amount: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

/** Full detail for the admin order page and invoice/receipt PDF. */
export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      items: { orderBy: { id: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
      statusHistory: { orderBy: { createdAt: "asc" }, include: { changedBy: { select: { name: true } } } },
      assignedEmployee: { select: { id: true, name: true } },
      quotation: { select: { id: true, quotationNumber: true } },
    },
  });
}

/** Active staff for the "assign to" select — a small team, so no role filtering. */
export async function getActiveStaffForAssignment() {
  return db.adminUser.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
