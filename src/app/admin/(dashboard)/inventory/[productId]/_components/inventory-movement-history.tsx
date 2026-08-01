import Link from "next/link";
import { History, PackagePlus, PackageMinus, ShoppingBag, ClipboardCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface InventoryMovementRow {
  id: string;
  type: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  reference: string | null;
  order: { id: string; orderNumber: string } | null;
  performedByName: string | null;
  createdAt: Date;
}

function getMovementIcon(type: string, quantityChange: number) {
  if (type.includes("RECEIVE") || quantityChange > 0) {
    return <PackagePlus className="h-4 w-4 text-success-600 dark:text-success-400" />;
  }
  if (type.includes("SALE") || type.includes("ORDER")) {
    return <ShoppingBag className="h-4 w-4 text-brand-600 dark:text-brand-400" />;
  }
  if (type.includes("COUNT")) {
    return <ClipboardCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />;
  }
  return <PackageMinus className="h-4 w-4 text-danger-600 dark:text-danger-400" />;
}

/** Read-only immutable audit log explaining every stock delta. */
export function InventoryMovementHistory({ movements }: Readonly<{ movements: InventoryMovementRow[] }>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <CardTitle>Immutable Stock Movement Audit Trail</CardTitle>
          </div>
          <span className="text-xs text-neutral-500 font-medium">{movements.length} logged event(s)</span>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <EmptyState
            title="No stock movements yet"
            description="Every receive, sale, damage, count, or reservation change will show here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {movements.map((movement) => {
              const isPositive = movement.quantityChange >= 0;
              return (
                <div key={movement.id} className="flex flex-col gap-1.5 py-3 text-sm hover:bg-surface-muted/30 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      {getMovementIcon(movement.type, movement.quantityChange)}
                      <span>{movement.type.replaceAll("_", " ")}</span>
                    </div>

                    <span
                      className={
                        isPositive
                          ? "font-mono font-bold text-success-700 dark:text-success-300"
                          : "font-mono font-bold text-danger-700 dark:text-danger-300"
                      }
                    >
                      {isPositive ? "+" : ""}
                      {movement.quantityChange} units
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                    <span className="font-mono text-neutral-600 dark:text-neutral-400">
                      {movement.previousQuantity} → {movement.newQuantity}
                    </span>
                    {movement.reason && <span>· Reason: {movement.reason}</span>}
                    {movement.reference && (
                      <span className="bg-surface-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-neutral-600">
                        Ref: {movement.reference}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-neutral-400 pt-0.5">
                    <span>
                      Operator: <span className="font-medium text-foreground">{movement.performedByName ?? "System"}</span>
                      {movement.order && (
                        <>
                          {" · "}
                          <Link
                            href={`/admin/orders/${movement.order.id}`}
                            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                          >
                            Order #{movement.order.orderNumber}
                          </Link>
                        </>
                      )}
                    </span>
                    <span>
                      {new Date(movement.createdAt).toLocaleString("en-KE", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
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
