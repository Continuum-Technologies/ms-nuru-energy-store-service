import type { OrderStatus } from "@/generated/prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

/** Shared by `/admin/orders`'s list page and the dashboard's `RecentOrdersWidget` — one mapping, not two copies. */
export function getOrderStatusTone(status: OrderStatus): NonNullable<BadgeProps["tone"]> {
  switch (status) {
    case "NEW":
    case "AWAITING_CONFIRMATION":
    case "AWAITING_PAYMENT":
    case "PAYMENT_VERIFICATION_REQUIRED":
      return "warning";
    case "PAID":
    case "CONFIRMED":
    case "PROCESSING":
    case "READY_FOR_COLLECTION":
    case "READY_FOR_DISPATCH":
    case "DISPATCHED":
      return "brand";
    case "DELIVERED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "danger";
  }
}
