import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getOrderById, getActiveStaffForAssignment } from "@/modules/orders/queries";
import { getOrderStatusTone } from "@/modules/orders/status-tone";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OrderCustomerDetails } from "./_components/order-customer-details";
import { OrderItems } from "./_components/order-items";
import { OrderPayments } from "./_components/order-payments";
import { OrderStatusHistory } from "./_components/order-status-history";
import { OrderReturnForm } from "./_components/order-return-form";
import { OrderActions } from "./_components/order-actions";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Readonly<OrderDetailPageProps>) {
  await requirePermissionOrRedirect("orders.view");
  const { id } = await params;

  const [order, staff] = await Promise.all([getOrderById(id), getActiveStaffForAssignment()]);
  if (!order) notFound();

  const customerName = order.guestName || order.customer?.name || "Customer";
  const customerPhone = order.guestPhone || order.customer?.phone || null;
  const customerEmail = order.guestEmail || order.customer?.email || null;

  const isPaymentVerified = [
    "PAID",
    "CONFIRMED",
    "PROCESSING",
    "READY_FOR_COLLECTION",
    "READY_FOR_DISPATCH",
    "DISPATCHED",
    "DELIVERED",
    "COMPLETED",
  ].includes(order.status);

  const isDispatchActive = [
    "PROCESSING",
    "READY_FOR_COLLECTION",
    "READY_FOR_DISPATCH",
    "DISPATCHED",
    "DELIVERED",
    "COMPLETED",
  ].includes(order.status);

  const isFulfilled = ["DELIVERED", "COMPLETED"].includes(order.status);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/orders"
            className="flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Orders Ledger
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight font-mono text-foreground">
              {order.orderNumber}
            </h1>
            <Badge tone={getOrderStatusTone(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
            {order.quotation && (
              <Link
                href={`/admin/quotations/${order.quotation.id}`}
                className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300 hover:underline"
              >
                <FileText className="h-3 w-3" />
                Converted from #{order.quotation.quotationNumber}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/admin/orders/${order.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold" })}
          >
            <Download className="h-3.5 w-3.5" />
            Download / Print Order PDF
          </a>
        </div>
      </div>

      {/* Fulfillment Stepper */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-2xl border border-border/80 bg-surface p-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted/50 p-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shrink-0">
            1
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">Order Placed</span>
            <span className="text-[10px] text-neutral-500 truncate">Customer Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted/50 p-2.5">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
              isPaymentVerified ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"
            }`}
          >
            2
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">Payment Verified</span>
            <span className="text-[10px] text-neutral-500 truncate">{isPaymentVerified ? "Funds Cleared" : "Awaiting Payment"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted/50 p-2.5">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
              isDispatchActive ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"
            }`}
          >
            3
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">Packing & Dispatch</span>
            <span className="text-[10px] text-neutral-500 truncate">{isDispatchActive ? "In Processing" : "Pending Dispatch"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted/50 p-2.5">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
              isFulfilled ? "bg-success-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"
            }`}
          >
            4
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">Delivered & Complete</span>
            <span className="text-[10px] text-neutral-500 truncate">{isFulfilled ? "Handover Done" : "In Progress"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <OrderCustomerDetails
            customerName={customerName}
            customerPhone={customerPhone ?? "—"}
            customerEmail={customerEmail}
            county={order.county}
            town={order.town}
            deliveryLocation={order.deliveryLocation}
            deliveryInstructions={order.deliveryInstructions}
            customerNotes={order.customerNotes}
          />

          <OrderItems
            items={order.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              productSku: item.productSku,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              lineTotal: Number(item.lineTotal),
            }))}
            subtotal={Number(order.subtotal)}
            discountTotal={Number(order.discountTotal)}
            installationCharge={Number(order.installationCharge)}
            deliveryCharge={Number(order.deliveryCharge)}
            taxTotal={Number(order.taxTotal)}
            total={Number(order.total)}
          />

          <OrderPayments
            orderId={order.id}
            payments={order.payments.map((payment) => ({
              id: payment.id,
              method: payment.method,
              amount: Number(payment.amount),
              status: payment.status,
              reference: payment.reference,
              providerReference: payment.providerReference,
              paidAt: payment.paidAt,
              notes: payment.notes,
            }))}
          />

          {isFulfilled && (
            <OrderReturnForm
              orderId={order.id}
              items={order.items.map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity }))}
            />
          )}

          <OrderStatusHistory
            entries={order.statusHistory.map((entry) => ({
              id: entry.id,
              fromStatus: entry.fromStatus,
              toStatus: entry.toStatus,
              changedByName: entry.changedBy?.name ?? null,
              createdAt: entry.createdAt,
            }))}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderActions
            orderId={order.id}
            orderNumber={order.orderNumber}
            status={order.status}
            internalNotes={order.internalNotes}
            assignedEmployeeId={order.assignedEmployee?.id ?? null}
            staff={staff}
            customerPhone={customerPhone}
          />
        </div>
      </div>
    </div>
  );
}
