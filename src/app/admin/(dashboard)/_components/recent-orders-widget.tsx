import Link from "next/link";
import { ShoppingCart, ArrowRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/infrastructure/database/client";
import { formatKes } from "@/lib/currency";
import type { OrderStatus } from "@/generated/prisma/client";

function getStatusBadgeTone(status: OrderStatus): "neutral" | "brand" | "success" | "warning" | "danger" | "info" {
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

export async function RecentOrdersWidget() {
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      guestName: true,
      customer: { select: { name: true, email: true } },
    },
  });

  return (
    <Card className="flex flex-col border-border/80 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-surface/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-brand-600" />
          <CardTitle className="text-base font-bold text-foreground">Recent Orders</CardTitle>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-neutral-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No recent orders</p>
            <p className="mt-1 text-xs text-neutral-500">
              Orders placed on the storefront will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentOrders.map((order) => {
              const customerName = order.guestName || order.customer?.name || "Customer";

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{order.orderNumber}</span>
                      <Badge tone={getStatusBadgeTone(order.status)} className="text-[10px] font-semibold">
                        {order.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-xs text-neutral-500">{customerName}</span>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold text-foreground">{formatKes(Number(order.total))}</span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
