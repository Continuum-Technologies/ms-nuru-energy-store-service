import Link from "next/link";
import { History } from "lucide-react";
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

/** Read-only — an immutable audit log (CLAUDE.md §4). "The platform should be able to explain why the current quantity has changed" (PRD §13.2) is exactly what this table answers. */
export function InventoryMovementHistory({ movements }: Readonly<{ movements: InventoryMovementRow[] }>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-600" />
          <CardTitle>Movement History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <EmptyState title="No stock movements yet" description="Every receive, sale, damage, count, or reservation change will show here." />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {movements.map((movement) => (
              <div key={movement.id} className="flex flex-col gap-1 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{movement.type.replaceAll("_", " ")}</span>
                  <span className={movement.quantityChange >= 0 ? "font-bold text-success-700 dark:text-success-200" : "font-bold text-danger-700 dark:text-danger-200"}>
                    {movement.quantityChange >= 0 ? "+" : ""}
                    {movement.quantityChange}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {movement.previousQuantity} → {movement.newQuantity}
                  {movement.reason ? ` · ${movement.reason}` : ""}
                  {movement.reference ? ` · Ref: ${movement.reference}` : ""}
                </span>
                <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
                  <span>
                    {movement.performedByName ?? "System"}
                    {movement.order && (
                      <>
                        {" · "}
                        <Link href={`/admin/orders/${movement.order.id}`} className="text-brand-600 hover:underline dark:text-brand-400">
                          Order {movement.order.orderNumber}
                        </Link>
                      </>
                    )}
                  </span>
                  <span>{new Date(movement.createdAt).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
