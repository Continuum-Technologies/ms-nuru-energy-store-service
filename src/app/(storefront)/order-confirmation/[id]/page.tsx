import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Clock,
} from "lucide-react";
import { getOrderConfirmation } from "@/modules/orders/queries";
import { formatKes } from "@/lib/currency";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutStepper } from "../../_components/checkout-stepper";
import { PrintReceiptButton } from "./_components/print-button";

export const metadata: Metadata = {
  title: "Order Confirmed | Nuru Energy Store",
  robots: { index: false, follow: false },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MPESA_TILL: "M-Pesa Till",
  MPESA_PAYBILL: "M-Pesa Paybill",
  BANK_TRANSFER: "Bank Transfer",
  CASH_ON_DELIVERY: "Cash on Delivery",
  PAYMENT_ON_COLLECTION: "Payment on Collection",
  MPESA_STK_PUSH: "M-Pesa Express",
  MANUAL: "Manual Payment",
};

const PAYMENT_METHOD_INSTRUCTIONS: Record<string, string> = {
  MPESA_TILL: "Our dispatch team will contact you shortly to verify delivery details and share the official M-Pesa Buy Goods Till Number.",
  MPESA_PAYBILL: "Our dispatch team will contact you with the official Paybill Business Number and your Order Reference.",
  BANK_TRANSFER: "Bank transfer details and Proforma Invoice will be sent directly to your phone/email by your account manager.",
  CASH_ON_DELIVERY: "Payment will be collected via M-Pesa or cash upon physical delivery by our logistics driver.",
  PAYMENT_ON_COLLECTION: "Payment will be finalized upon inspection when collecting equipment from our Nairobi center.",
};

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Readonly<OrderConfirmationPageProps>) {
  const { id } = await params;
  const order = await getOrderConfirmation(id);
  if (!order) notFound();

  const payment = order.payments[0];
  const formattedDate = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
      <CheckoutStepper currentStep={3} />

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-success-500/20 bg-success-50/40 p-6 dark:bg-success-500/10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success-600 text-white shadow-xs dark:bg-success-500">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-success-800 dark:text-success-300">
                Order #{order.orderNumber}
              </span>
              <span className="rounded-full bg-success-600/10 px-2.5 py-0.5 text-[10px] font-extrabold text-success-700 dark:text-success-300">
                RECEIVED & PROCESSING
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Thank You, {(order.guestName ?? "Customer").split(" ")[0]}!
            </h1>
            <p className="text-xs font-medium text-neutral-500">
              Placed on {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <PrintReceiptButton />
          <Link href="/shop" className={buttonVariants({ size: "sm", className: "gap-1.5 font-bold text-xs" })}>
            Continue Shopping
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Items Breakdown */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-600" />
                Equipment Ordered ({order.items.length})
              </h2>
              <span className="text-xs text-neutral-500 font-medium">Verified Equipment</span>
            </div>

            <div className="flex flex-col divide-y divide-border/60">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-bold text-foreground line-clamp-2">{item.productName}</span>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      {item.productSku && (
                        <span className="font-mono text-[10px] text-neutral-400 uppercase">
                          SKU: {item.productSku}
                        </span>
                      )}
                      <span>• Qty: {item.quantity}</span>
                      <span>• {formatKes(Number(item.unitPrice))} / unit</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-foreground shrink-0">
                    {formatKes(Number(item.lineTotal))}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Items Subtotal</span>
                <span className="font-bold text-foreground">{formatKes(Number(order.subtotal))}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500 text-xs">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-brand-600" />
                  Dispatch & Delivery
                </span>
                <span className="font-semibold text-success-700 dark:text-success-400">
                  Confirmed by Agent
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between text-base font-extrabold text-foreground">
                <span>Total Value</span>
                <span className="text-brand-600 dark:text-brand-400">{formatKes(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Logistics & Support Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-brand-600">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Questions About Your Order?</span>
                <span className="text-xs text-neutral-500">
                  Our Nairobi technical team is available to assist with dispatch scheduling or spec validation.
                </span>
              </div>
            </div>
            <Link
              href="/contact"
              className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0 text-xs" })}
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Right Column: Customer Info & Payment Details */}
        <div className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-24">
          {/* Delivery Info Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              Delivery Destination
            </h2>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">
                    {order.town}, {order.county} County
                  </span>
                  {order.deliveryLocation && (
                    <span className="text-neutral-500">{order.deliveryLocation}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="font-semibold text-foreground">{order.guestPhone}</span>
              </div>

              {order.guestEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">{order.guestEmail}</span>
                </div>
              )}

              {order.deliveryInstructions && (
                <div className="mt-1 rounded-xl bg-surface-muted p-3 text-neutral-600 dark:text-neutral-400">
                  <strong className="text-foreground">Instructions:</strong> {order.deliveryInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-600" />
              Payment Details
            </h2>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Method</span>
                <span className="font-bold text-foreground">
                  {payment ? PAYMENT_METHOD_LABELS[payment.method] ?? payment.method : "To be confirmed"}
                </span>
              </div>

              {payment && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Payment Status</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-warning-700 dark:text-warning-300">
                    <Clock className="h-3 w-3 text-warning-600" />
                    {payment.status}
                  </span>
                </div>
              )}

              <div className="mt-1 rounded-xl bg-brand-50/50 border border-brand-500/20 p-3 text-xs text-foreground dark:bg-brand-600/10">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">Next Step:</span>
                {payment ? (
                  PAYMENT_METHOD_INSTRUCTIONS[payment.method] ??
                  "Our representative will contact you with specific payment instructions."
                ) : (
                  "Our logistics team will call you to finalize payment instructions."
                )}
              </div>
            </div>

            {/* Guarantee Footer */}
            <div className="border-t border-border/80 pt-3 flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-success-600 shrink-0" />
              <span>Official Nuru Energy Store Order Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
