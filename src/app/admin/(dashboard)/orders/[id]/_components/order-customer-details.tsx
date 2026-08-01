import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Truck, FileText, ShieldCheck } from "lucide-react";

export interface OrderCustomerDetailsProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  county: string | null;
  town: string | null;
  deliveryLocation: string | null;
  deliveryInstructions: string | null;
  customerNotes: string | null;
}

export function OrderCustomerDetails({
  customerName,
  customerPhone,
  customerEmail,
  county,
  town,
  deliveryLocation,
  deliveryInstructions,
  customerNotes,
}: Readonly<OrderCustomerDetailsProps>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Customer & Delivery Profile</CardTitle>
          </div>
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
            <ShieldCheck className="h-3 w-3" />
            Confirmed Order Snapshot
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-4">
        {/* Information Group A: Customer Contact Profile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
            Customer Identification & Contact
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Customer Name</span>
                <span className="text-xs font-bold text-foreground truncate">{customerName}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Contact</span>
                {customerPhone !== "—" ? (
                  <a href={`tel:${customerPhone}`} className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400 truncate">
                    {customerPhone}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">—</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</span>
                {customerEmail ? (
                  <a href={`mailto:${customerEmail}`} className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400 truncate">
                    {customerEmail}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Group B: Delivery Destination */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
            Fulfillment Destination & Logistics
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">County & Town</span>
                <span className="text-xs font-bold text-foreground truncate">
                  {[county, town].filter(Boolean).join(", ") || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3 sm:col-span-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600 dark:bg-neutral-800 dark:text-brand-400 shrink-0 mt-0.5 shadow-2xs">
                <Truck className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Specific Delivery Location</span>
                <span className="text-xs font-bold text-foreground truncate">
                  {deliveryLocation || "Standard Store Pickup / Self Collection"}
                </span>
              </div>
            </div>
          </div>

          {deliveryInstructions && (
            <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-surface-muted/30 p-3 text-xs mt-1">
              <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Driver / Logistics Instructions:</span>
              <p className="text-foreground font-medium">{deliveryInstructions}</p>
            </div>
          )}
        </div>

        {/* Information Group C: Customer Notes */}
        {customerNotes && (
          <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-500/20 bg-brand-50/30 p-4 dark:bg-brand-600/10 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
              <FileText className="h-4 w-4 text-brand-600" />
              <span>Customer Checkout Notes:</span>
            </div>
            <p className="text-foreground leading-relaxed italic bg-surface/50 p-2.5 rounded-xl border border-border/40">
              &quot;{customerNotes}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
