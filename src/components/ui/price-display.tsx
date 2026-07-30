import { formatKes } from "@/lib/currency";
import { cn } from "@/lib/cn";

export interface PriceDisplayProps {
  sellingPrice: number;
  previousPrice?: number | null;
  hidePrice?: boolean;
  isQuotationOnly?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * The one place price formatting/discount math happens — every product
 * price shown anywhere (storefront grid, product detail, later admin
 * adoption) should render through this rather than re-deriving discount %
 * or the "contact for pricing" fallback per call site (CLAUDE.md §5).
 */
export function PriceDisplay({
  sellingPrice,
  previousPrice,
  hidePrice,
  isQuotationOnly,
  size = "sm",
  className,
}: Readonly<PriceDisplayProps>) {
  if (hidePrice || isQuotationOnly) {
    return (
      <span className={cn("font-bold text-foreground", size === "lg" ? "text-lg" : "text-sm", className)}>
        Contact for pricing
      </span>
    );
  }

  const hasDiscount = previousPrice !== null && previousPrice !== undefined && previousPrice > sellingPrice;
  const discountPercent = hasDiscount ? Math.round((1 - sellingPrice / previousPrice!) * 100) : null;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-bold text-foreground", size === "lg" ? "text-2xl" : "text-sm")}>
        {formatKes(sellingPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className={cn("text-neutral-400 line-through", size === "lg" ? "text-sm" : "text-xs")}>
            {formatKes(previousPrice!)}
          </span>
          <span className="rounded-pill bg-danger-50 px-1.5 py-0.5 text-[10px] font-bold text-danger-700 dark:bg-danger-600/15 dark:text-danger-200">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
