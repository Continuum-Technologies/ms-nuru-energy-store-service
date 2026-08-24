import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Headphones,
  CheckCircle2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { getCartWithItems } from "@/modules/cart/queries";
import { buttonVariants } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import { CartLineItem, type CartLineItemData } from "./_components/cart-line-item";
import { CheckoutStepper } from "../_components/checkout-stepper";

export const metadata: Metadata = {
  title: "Your Cart | Nuru Energy",
  description: "Review your solar panels, inverters, batteries, and machinery equipment before checkout.",
  robots: { index: false, follow: false },
};

const FREE_SHIPPING_THRESHOLD = 100000; // Ksh 100,000 for Free Nairobi Dispatch

export default async function CartPage() {
  const cart = await getCartWithItems();

  const items: CartLineItemData[] = cart.items.map((item) => {
    const image = item.product.images[0];

    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        sellingPrice: Number(item.product.sellingPrice),
        previousPrice: item.product.previousPrice ? Number(item.product.previousPrice) : null,
        hidePrice: item.product.hidePrice,
        isQuotationOnly: item.product.isQuotationOnly,
        imageUrl: image?.url ?? null,
        imageAlt: image?.altText ?? null,
        inventoryItem: item.product.inventoryItem,
      },
    };
  });

  const subtotal = items
    .filter((item) => !item.product.hidePrice && !item.product.isQuotationOnly)
    .reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  const hasQuotationOnlyItems = items.some((item) => item.product.hidePrice || item.product.isQuotationOnly);

  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300">
          <ShoppingBag className="h-10 w-10" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h1 className="text-2xl font-extrabold text-foreground">Your Equipment Cart is Empty</h1>
          <p className="text-sm text-neutral-500">
            You haven&apos;t added any solar panels, batteries, inverters, or power equipment to your cart yet.
          </p>
        </div>

        <Link href="/shop" className={buttonVariants({ size: "lg", className: "gap-2 font-bold" })}>
          <ShoppingBag className="h-4 w-4" />
          Browse Full Catalog
        </Link>

        {/* Popular Categories Links */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border/60 pt-6 w-full max-w-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Popular Equipment Categories:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: "Solar Panels", slug: "solar-panels" },
              { name: "Solar Batteries", slug: "solar-batteries" },
              { name: "Solar Inverters", slug: "solar-inverters" },
              { name: "Generators", slug: "generators-engines" },
              { name: "Water Pumps", slug: "water-borehole-solutions" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-brand-500 hover:text-brand-600 dark:text-neutral-300"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
      {/* Checkout Stepper Progress Bar */}
      <CheckoutStepper currentStep={1} />

      {/* Main Cart Header & Free Delivery Progress Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Shopping Cart</h1>
          <span className="text-sm font-medium text-neutral-500">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Free Delivery Threshold Bar */}
        <div className="rounded-2xl border border-brand-500/20 bg-brand-50/50 p-4 dark:bg-brand-600/10">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-brand-600" />
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-success-700 dark:text-success-300 font-bold">
                  🎉 Congratulations! You unlocked FREE Nairobi Dispatch!
                </span>
              ) : (
                <span>
                  Add <strong className="text-brand-600">{formatKes(remainingForFreeShipping)}</strong> more for FREE Nairobi Dispatch
                </span>
              )}
            </span>
            <span>{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-brand-600 transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cart Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Line Items Column */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}

          {/* Assistance Banner */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-brand-600">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Need Technical Assistance?</span>
                <span className="text-xs text-neutral-500">
                  Not sure if these solar panels or inverter match your power specs? Speak to a technical advisor.
                </span>
              </div>
            </div>
            <Link
              href="/request-quotation"
              className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0 gap-1.5 text-xs" })}
            >
              <FileText className="h-3.5 w-3.5" />
              Request Custom Quote
            </Link>
          </div>
        </div>

        {/* Sticky Order Summary Column */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-xs lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Order Summary</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Items Subtotal</span>
                <span className="font-bold text-foreground">{formatKes(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Estimated Delivery</span>
                <span className="font-semibold text-success-700 dark:text-success-400">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE (Nairobi)" : "Calculated at checkout"}
                </span>
              </div>

              {hasQuotationOnlyItems && (
                <div className="rounded-xl bg-warning-50 p-3 text-xs text-warning-800 dark:bg-warning-500/10 dark:text-warning-300">
                  Some items in your cart require custom pricing and will be processed via direct sales quotation.
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between text-base font-extrabold text-foreground">
              <span>Total Value</span>
              <span className="text-brand-600 dark:text-brand-400">{formatKes(subtotal)}</span>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/checkout"
                className={buttonVariants({ size: "lg", className: "w-full gap-2 font-bold justify-between text-sm" })}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/request-quotation"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "w-full gap-2 font-semibold text-xs",
                })}
              >
                <FileText className="h-4 w-4" />
                Request Institutional Quotation
              </Link>
            </div>

            {/* Guarantees List */}
            <div className="border-t border-border/80 pt-4 flex flex-col gap-2 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success-600 shrink-0" />
                <span>100% Genuine Kenyan Equipment Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Fast Dispatch Across All 47 Counties</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                <span>M-Pesa, Card & Bank Transfer Accepted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
