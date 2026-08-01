import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { formatKes } from "@/lib/currency";

export interface CheckoutSummaryItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    sellingPrice: number;
    imageUrl: string | null;
    imageAlt: string | null;
  };
}

export interface CheckoutSummaryProps {
  items: CheckoutSummaryItem[];
  subtotal: number;
}

/** Read-only cart recap for /checkout — no editing here, that's what /cart is for. */
export function CheckoutSummary({ items, subtotal }: Readonly<CheckoutSummaryProps>) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface p-5 lg:sticky lg:top-24 shadow-2xs">
      <h2 className="text-sm font-bold text-foreground">Order Summary</h2>

      <div className="flex flex-col gap-3.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted/60 border border-border/60">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.imageAlt ?? item.product.name}
                  fill
                  sizes="48px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                  <PackageSearch className="h-5 w-5 stroke-1" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <span className="line-clamp-2 text-xs font-bold text-foreground leading-snug">
                {item.product.name}
              </span>
              <span className="text-[11px] font-medium text-neutral-500">Qty: {item.quantity}</span>
            </div>
            <span className="text-xs font-extrabold text-foreground shrink-0">
              {formatKes(item.product.sellingPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
        <span className="text-neutral-500">Subtotal</span>
        <span className="font-bold text-foreground">{formatKes(subtotal)}</span>
      </div>
      <p className="text-xs text-neutral-400">Delivery cost will be confirmed by our team after order placement.</p>
    </div>
  );
}
