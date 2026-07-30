import Link from "next/link";
import { Wrench, ShieldCheck, FileText } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { StockBadge } from "@/components/ui/stock-badge";
import { buttonVariants } from "@/components/ui/button";
import type { AvailabilityStatus } from "@/lib/inventory-status";

export interface ProductPurchasePanelProps {
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

/** Price, availability, brand link and the quotation CTA — the PDP's right-hand action column. */
export function ProductPurchasePanel({
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

      <Link
        href={`/request-quotation?product=${productSlug}`}
        className={buttonVariants({ className: "w-full gap-2 font-bold" })}
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
