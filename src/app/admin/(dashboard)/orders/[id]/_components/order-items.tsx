import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, ShieldCheck } from "lucide-react";
import { formatKes } from "@/lib/currency";

export interface OrderItemRow {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderItemsProps {
  items: OrderItemRow[];
  subtotal: number;
  discountTotal: number;
  installationCharge: number;
  deliveryCharge: number;
  taxTotal: number;
  total: number;
}

/** Read-only invoice itemization — line items are frozen snapshot records. */
export function OrderItems({
  items,
  subtotal,
  discountTotal,
  installationCharge,
  deliveryCharge,
  taxTotal,
  total,
}: Readonly<OrderItemsProps>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Equipment & Line Itemization</CardTitle>
          </div>
          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
            {items.length} {items.length === 1 ? "Line Item" : "Line Items"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-4">
        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-surface-muted/50 font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-2.5 px-3">Equipment / Item Description</th>
                <th className="py-2.5 px-3 text-center">SKU</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-foreground block">{item.productName}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-[11px] font-semibold text-neutral-500">{item.productSku}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-md bg-surface-muted px-2 py-0.5 font-bold text-foreground">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-600 dark:text-neutral-300">
                    {formatKes(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-foreground">
                    {formatKes(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-t border-border/60 pt-4">
          <div className="flex flex-col gap-1.5 text-xs text-neutral-500 max-w-xs">
            <span className="font-bold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
              Tax Invoice Guarantee
            </span>
            <p>
              Prices include 16% Kenya VAT where applicable. Items reserved upon payment confirmation.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-surface-muted/30 p-4 sm:w-80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Equipment Subtotal</span>
              <span className="font-mono font-bold text-foreground">{formatKes(subtotal)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex items-center justify-between text-success-700 dark:text-success-300 font-semibold">
                <span>Promotional Discount</span>
                <span className="font-mono">-{formatKes(discountTotal)}</span>
              </div>
            )}

            {installationCharge > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Installation & Commissioning</span>
                <span className="font-mono font-bold text-foreground">{formatKes(installationCharge)}</span>
              </div>
            )}

            {deliveryCharge > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Logistics & Delivery Freight</span>
                <span className="font-mono font-bold text-foreground">{formatKes(deliveryCharge)}</span>
              </div>
            )}

            {taxTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">VAT Tax (16%)</span>
                <span className="font-mono font-bold text-foreground">{formatKes(taxTotal)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/80 pt-2.5 text-sm font-black">
              <span className="text-foreground uppercase tracking-wide">Net Total Due</span>
              <span className="font-mono text-base text-brand-600 dark:text-brand-400">{formatKes(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
