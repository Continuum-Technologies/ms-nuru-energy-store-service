"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { PackageSearch, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatKes } from "@/lib/currency";
import { updateCartItemQuantity, removeCartItem } from "@/modules/cart/actions";

export interface CartLineItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    sellingPrice: number;
    previousPrice: number | null;
    hidePrice: boolean;
    isQuotationOnly: boolean;
    imageUrl: string | null;
    imageAlt: string | null;
    inventoryItem?: {
      quantityOnHand: number;
      allowBackorder: boolean;
    } | null;
  };
}

export function CartLineItem({ item }: Readonly<{ item: CartLineItemData }>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleQuantityChange(quantity: number) {
    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity);
      if (result?.error) setError(result.error);
    });
  }

  const stockQty = item.product.inventoryItem?.quantityOnHand ?? 0;
  const allowBackorder = item.product.inventoryItem?.allowBackorder ?? false;

  const renderStockBadge = () => {
    if (stockQty > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-300">
          <CheckCircle2 className="h-3 w-3 text-success-600" />
          In Stock ({stockQty} ready)
        </span>
      );
    }

    if (allowBackorder) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-semibold text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
          <Clock className="h-3 w-3 text-warning-600" />
          Available on Backorder
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        Verified Catalog Item
      </span>
    );
  };

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-all shadow-2xs hover:border-brand-500/30">
      {/* Product Image Thumbnail */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-surface-muted/60 border border-border/60"
      >
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.imageAlt ?? item.product.name}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <PackageSearch className="h-8 w-8 stroke-1" />
          </div>
        )}
      </Link>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {item.product.sku && (
                <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
                  SKU: {item.product.sku}
                </span>
              )}

              {/* Stock Status Badge */}
              {renderStockBadge()}
            </div>

            <Link
              href={`/products/${item.product.slug}`}
              className="text-sm font-bold text-foreground hover:text-brand-600 transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => removeCartItem(item.id))}
            aria-label="Remove item from cart"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-danger-600 transition-colors shrink-0 dark:hover:bg-neutral-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/40 pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Unit Price</span>
            <PriceDisplay
              sellingPrice={item.product.sellingPrice}
              previousPrice={item.product.previousPrice}
              hidePrice={item.product.hidePrice}
              isQuotationOnly={item.product.isQuotationOnly}
            />
          </div>

          <div className="flex items-center gap-4">
            <QuantityStepper value={item.quantity} disabled={pending} onChange={handleQuantityChange} />

            {!item.product.hidePrice && !item.product.isQuotationOnly && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Line Total</span>
                <span className="text-sm font-extrabold text-foreground">
                  {formatKes(item.product.sellingPrice * item.quantity)}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-danger-600 pt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
