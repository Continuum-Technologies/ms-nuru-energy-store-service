import Image from "next/image";
import { PackageSearch, ShieldCheck, Clock, FileCheck, PhoneCall, Headphones, Truck, Award } from "lucide-react";
import { formatKes } from "@/lib/currency";

export interface QuotationRequestSummaryItem {
  id: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface QuotationRequestSummaryProps {
  items: QuotationRequestSummaryItem[];
  heading: string;
}

/** Read-only recap of what the quotation request is about — or helpful technical advice cards when general request. */
export function QuotationRequestSummary({ items, heading }: Readonly<QuotationRequestSummaryProps>) {
  const totalValue = items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Selected Items Card (if seeded by cart or product) */}
      {items.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">{heading}</h2>
          <div className="flex flex-col gap-3.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted/60 border border-border/60">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt ?? item.name}
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
                  <span className="line-clamp-2 text-xs font-bold text-foreground leading-snug">{item.name}</span>
                  <span className="text-[11px] font-medium text-neutral-500">Qty: {item.quantity}</span>
                </div>
                <span className="text-xs font-extrabold text-foreground shrink-0">
                  {formatKes(item.sellingPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="text-neutral-500">Indicative Catalog Value</span>
            <span className="font-extrabold text-foreground">{formatKes(totalValue)}</span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-normal">
            * Reference catalog pricing shown. Official quotation will detail exact specs, volume discounts, logistics, or custom installation options.
          </p>
        </div>
      )}

      {/* Institutional & General Guarantees Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs text-xs text-neutral-600 dark:text-neutral-400">
        <h3 className="font-bold text-foreground border-b border-border pb-2.5 text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-600" />
          Why Request a Quote With Us?
        </h3>

        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Fast 24-Hour SLA</span>
            <span className="text-[11px] text-neutral-500">Written PDF quotations sent straight to your email or WhatsApp within 24 hours.</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileCheck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Official KRA & EPRA Compliant</span>
            <span className="text-[11px] text-neutral-500">Includes KRA E-TIMS QR invoicing, valid tax clearance, and manufacturer warranties.</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Truck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Countrywide Kenya Logistics</span>
            <span className="text-[11px] text-neutral-500">Delivery and technical installation available in Nairobi and all 47 counties.</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">For Home, Farm & Commercial</span>
            <span className="text-[11px] text-neutral-500">Open to individuals, homeowners, agricultural projects, and large institutions.</span>
          </div>
        </div>
      </div>

      {/* Direct Assistance Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-500/20 bg-brand-50/30 p-5 dark:bg-brand-600/10 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shrink-0">
            <Headphones className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Need Urgent Assistance?</span>
            <span className="text-[11px] text-neutral-500">Speak directly with an engineering consultant.</span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-brand-500/20 pt-2.5 text-foreground font-semibold">
          <span className="flex items-center gap-1.5 text-[11px]">
            <PhoneCall className="h-3.5 w-3.5 text-brand-600" />
            +254 719 375 096
          </span>
          <span className="text-[10px] text-neutral-500">Mon - Sat: 8am - 6pm</span>
        </div>
      </div>
    </div>
  );
}
