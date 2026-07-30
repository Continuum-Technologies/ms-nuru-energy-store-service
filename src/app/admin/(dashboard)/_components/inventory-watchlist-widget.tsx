import Link from "next/link";
import { AlertTriangle, ArrowRight, PackageCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/infrastructure/database/client";

export async function InventoryWatchlistWidget() {
  // No `take` limit here — filtering for low/out-of-stock happens in JS after
  // the fetch (see _lib/operational-stats.ts for why), so limiting the query
  // itself would risk silently missing real alerts once the catalog has more
  // than a handful of products. Fine while the catalog is small; worth a
  // proper query once it scales.
  const inventoryItems = await db.inventoryItem.findMany({
    include: { product: { select: { name: true, sku: true } } },
  });

  const alertItems = inventoryItems.filter((item) => item.quantityOnHand <= item.reorderLevel);

  return (
    <Card className="flex flex-col border-border/80 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-surface/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning-600 dark:text-warning-400" />
          <CardTitle className="text-base font-bold text-foreground">Stock Alert Watchlist</CardTitle>
        </div>
        <Link
          href="/admin/inventory"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Manage Stock
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {alertItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-400">
              <PackageCheck className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">All products well-stocked</p>
            <p className="mt-1 text-xs text-neutral-500">
              No products are currently at or below reorder threshold.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {alertItems.slice(0, 5).map((item) => {
              const isOut = item.quantityOnHand === 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-muted/50"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {item.product.name}
                    </span>
                    <span className="text-xs text-neutral-500">SKU: {item.product.sku}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-foreground">
                        {item.quantityOnHand} in stock
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Reorder at {item.reorderLevel}
                      </span>
                    </div>

                    <Badge tone={isOut ? "danger" : "warning"} className="text-[10px] font-semibold">
                      {isOut ? "OUT OF STOCK" : "LOW STOCK"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
