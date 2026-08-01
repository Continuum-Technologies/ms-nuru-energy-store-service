"use client";

import { useActionState } from "react";
import { Boxes } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { updateReorderSettings } from "@/modules/inventory/admin-actions";

export interface InventoryItemSummaryProps {
  productId: string;
  quantityOnHand: number;
  reservedQuantity: number;
  reorderLevel: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  lastCountedAt: Date | null;
}

export function InventoryItemSummary({
  productId,
  quantityOnHand,
  reservedQuantity,
  reorderLevel,
  lowStockThreshold,
  allowBackorder,
  lastCountedAt,
}: Readonly<InventoryItemSummaryProps>) {
  const [state, formAction, pending] = useActionState(updateReorderSettings.bind(null, productId), undefined);
  const available = quantityOnHand - reservedQuantity;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <CardTitle>Live Stock Metrics & Thresholds</CardTitle>
          </div>
          {lastCountedAt && (
            <span className="text-xs text-neutral-500 font-medium">
              Last counted {new Date(lastCountedAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4 shadow-sm">
            <span className="text-3xl font-extrabold text-foreground">{quantityOnHand.toLocaleString("en-KE")}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total On Hand</span>
          </div>

          <div className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4 shadow-sm">
            <span className="text-3xl font-extrabold text-warning-700 dark:text-warning-300">
              {reservedQuantity.toLocaleString("en-KE")}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Reserved Units</span>
          </div>

          <div className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4 shadow-sm">
            <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              {available.toLocaleString("en-KE")}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Available</span>
          </div>
        </div>

        {/* Threshold Settings Form */}
        <form action={formAction} className="flex flex-col gap-4 border-t border-border/60 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Inventory Threshold Configuration</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Reorder Level" htmlFor="reorderLevel" hint="Triggers admin low-stock warnings when on-hand drops to or below this.">
              <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={reorderLevel} />
            </FormField>
            <FormField label="Low Stock Threshold" htmlFor="lowStockThreshold" hint="Shows 'Low Stock' badge to storefront shoppers.">
              <Input id="lowStockThreshold" name="lowStockThreshold" type="number" min={0} defaultValue={lowStockThreshold} />
            </FormField>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer select-none">
            <Checkbox name="allowBackorder" defaultChecked={allowBackorder} />
            <span>Allow backorders when available stock hits zero</span>
          </label>

          {state?.error && <p className="text-sm font-medium text-danger-600">{state.error}</p>}

          <Button type="submit" size="sm" disabled={pending} className="self-start font-bold">
            {pending ? "Saving Thresholds…" : "Save Reorder Thresholds"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
