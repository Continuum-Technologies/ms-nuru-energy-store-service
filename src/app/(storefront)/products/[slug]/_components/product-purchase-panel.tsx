"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, FileText } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { StockBadge } from "@/components/ui/stock-badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import type { AvailabilityStatus } from "@/lib/inventory-status";
import { AddToCartButton } from "../../../_components/add-to-cart-button";

export interface ProductPurchasePanelProps {
  productId: string;
  sellingPrice: number;
  previousPrice: number | null;
  hidePrice: boolean;
  isQuotationOnly: boolean;
  availabilityStatus: AvailabilityStatus;
  brand: { name: string; slug: string } | null;
  installationAvailable: boolean;
  installationRequired: boolean;
  productSlug: string;
}

/** Price, availability, quantity picker, add-to-cart and the quotation CTA — the PDP's right-hand action column. */
export function ProductPurchasePanel({
  productId,
  sellingPrice,
  previousPrice,
  hidePrice,
  isQuotationOnly,
  availabilityStatus,
  brand,
  installationAvailable,
  installationRequired,
  productSlug,
}: Readonly<ProductPurchasePanelProps>) {
  const [quantity, setQuantity] = useState(1);
  const canAddToCart = !hidePrice && !isQuotationOnly && availabilityStatus !== "OUT_OF_STOCK";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface p-5">
      {brand && (
        <Link href={`/brands/${brand.slug}`} className="text-xs font-bold uppercase tracking-wide text-brand-600 hover:underline dark:text-brand-400">
          {brand.name}
        </Link>
      )}

      <PriceDisplay
        sellingPrice={sellingPrice}
        previousPrice={previousPrice}
        hidePrice={hidePrice}
        isQuotationOnly={isQuotationOnly}
        size="lg"
      />

      <StockBadge status={availabilityStatus} className="self-start" />

      {(installationAvailable || installationRequired) && (
        <div className="flex items-center gap-2 rounded-control border border-border/60 bg-surface-muted/40 px-3 py-2 text-xs font-semibold text-foreground">
          <Wrench className="h-4 w-4 text-info-700 dark:text-info-200" />
          {installationRequired ? "Professional installation required" : "Installation service available"}
        </div>
      )}

      {canAddToCart && (
        <div className="flex items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <div className="flex-1">
            <AddToCartButton productId={productId} quantity={quantity} className="w-full" />
          </div>
        </div>
      )}

      <Link
        href={`/request-quotation?product=${productSlug}`}
        className={buttonVariants({ variant: canAddToCart ? "outline" : "primary", className: "w-full gap-2 font-bold" })}
      >
        <FileText className="h-4 w-4" />
        Request Quotation
      </Link>

      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <ShieldCheck className="h-4 w-4 text-success-700 dark:text-success-200" />
        Genuine equipment, warranty-backed
      </div>
    </div>
  );
}
