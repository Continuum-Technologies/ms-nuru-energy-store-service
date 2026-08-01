import Link from "next/link";
import { ShoppingCart, ShoppingBag, Clock, Truck, CheckCircle2, ArrowUpRight, FileText } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getOrdersList, getOrderStats } from "@/modules/orders/queries";
import { getOrderStatusTone } from "@/modules/orders/status-tone";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKes } from "@/lib/currency";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

const PAYMENT_STATUS_TONE: Record<PaymentStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  INITIATED: "info",
  PROCESSING: "info",
  SUCCESSFUL: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
  VERIFICATION_REQUIRED: "warning",
  PARTIALLY_PAID: "warning",
  REFUNDED: "danger",
  PARTIALLY_REFUNDED: "danger",
};

interface OrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  location: string;
  itemCount: number;
  total: number;
  createdAt: Date;
  assignedTo: string | null;
  paymentStatus: PaymentStatus | null;
  paymentMethod: string | null;
  quotationNumber: string | null;
}

export default async function OrdersPage() {
  await requirePermissionOrRedirect("orders.view");

  const [orders, stats] = await Promise.all([getOrdersList(), getOrderStats()]);

  const rows: OrderRow[] = orders.map((order) => {
    const customerName = order.guestName || order.customer?.name || "Customer";
    const customerPhone = order.guestPhone || order.customer?.phone || null;
    const customerEmail = order.guestEmail || order.customer?.email || null;
    const locationParts = [order.county, order.town].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(", ") : "—";
    const payment = order.payments[0];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName,
      customerPhone,
      customerEmail,
      location,
      itemCount: order.items.length,
      total: Number(order.total),
      createdAt: order.createdAt,
      assignedTo: order.assignedEmployee?.name ?? null,
      paymentStatus: payment?.status ?? null,
      paymentMethod: payment?.method ?? null,
      quotationNumber: order.quotation?.quotationNumber ?? null,
    };
  });

  const columns: DataListColumn<OrderRow>[] = [
    {
      key: "number",
      header: "Order Ref",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Link
            href={`/admin/orders/${row.id}`}
            className="font-mono text-sm font-extrabold text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {row.orderNumber}
          </Link>
          {row.quotationNumber && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
              <FileText className="h-2.5 w-2.5" />
              Quote #{row.quotationNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer Contact",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.customerName}</span>
          <span className="text-[11px] text-neutral-500 font-medium">
            {row.customerPhone || row.customerEmail || "No contact info"}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Destination",
      hideOnMobile: true,
      render: (row) => <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">{row.location}</span>,
    },
    {
      key: "items",
      header: "Items",
      hideOnMobile: true,
      render: (row) => (
        <span className="inline-flex items-center rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          {row.itemCount} {row.itemCount === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      hideOnMobile: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {row.paymentStatus ? (
            <Badge tone={PAYMENT_STATUS_TONE[row.paymentStatus]}>{row.paymentStatus.replaceAll("_", " ")}</Badge>
          ) : (
            <span className="text-xs text-neutral-400">—</span>
          )}
          {row.paymentMethod && (
            <span className="text-[10px] text-neutral-400 font-medium">{row.paymentMethod.replaceAll("_", " ")}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Fulfillment Status",
      render: (row) => <Badge tone={getOrderStatusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge>,
    },
    {
      key: "total",
      header: "Total Value",
      render: (row) => (
        <span className="font-mono text-sm font-extrabold text-foreground">{formatKes(row.total)}</span>
      ),
    },
    {
      key: "assigned",
      header: "Assigned To",
      hideOnMobile: true,
      render: (row) => <span className="text-xs text-neutral-500">{row.assignedTo ?? "—"}</span>,
    },
    {
      key: "date",
      header: "Date Placed",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs text-neutral-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs font-bold text-neutral-600 hover:border-brand-500/40 hover:bg-brand-50/40 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-brand-600/10 dark:hover:text-brand-400 transition-colors"
        >
          View
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Orders Ledger</h1>
          <p className="text-xs text-neutral-500">Track, confirm, and fulfill customer equipment orders and dispatch.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-brand-500/20 bg-brand-50/40 dark:bg-brand-600/10 px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">Total Sales Volume:</span>
            <span className="font-mono text-sm font-black text-brand-600 dark:text-brand-400">
              {formatKes(stats.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Orders"
          value={stats.totalCount}
          subtitle={`${formatKes(stats.totalRevenue)} net revenue`}
          icon={<ShoppingBag className="h-4 w-4" />}
          tone="brand"
        />
        <KpiCard
          title="Pending Action"
          value={stats.pendingCount}
          subtitle="Awaiting payment or confirmation"
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
        />
        <KpiCard
          title="Fulfillment Active"
          value={stats.processingCount}
          subtitle="Paid, packing or in dispatch"
          icon={<Truck className="h-4 w-4" />}
          tone="info"
        />
        <KpiCard
          title="Delivered / Complete"
          value={stats.completedCount}
          subtitle="Successfully fulfilled deals"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
      </div>

      {/* Main Data Table */}
      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.orderNumber}
        mobileAccessory={(row) => <Badge tone={getOrderStatusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge>}
        emptyState={
          <EmptyState
            title="No orders found"
            description="Customer checkout purchases and converted quotations will be recorded here automatically."
            action={<ShoppingCart className="h-5 w-5 text-neutral-400" />}
          />
        }
      />
    </div>
  );
}
