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
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-brand-600" />
          <CardTitle>Stock Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col gap-1 rounded-control border border-border/60 p-3">
            <span className="text-2xl font-bold text-foreground">{quantityOnHand}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">On Hand</span>
          </div>
          <div className="flex flex-col gap-1 rounded-control border border-border/60 p-3">
            <span className="text-2xl font-bold text-foreground">{reservedQuantity}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Reserved</span>
          </div>
          <div className="flex flex-col gap-1 rounded-control border border-border/60 p-3">
            <span className="text-2xl font-bold text-foreground">{available}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Available</span>
          </div>
        </div>

        {lastCountedAt && (
          <p className="text-xs text-neutral-500">Last physically counted {new Date(lastCountedAt).toLocaleDateString("en-KE")}.</p>
        )}

        <form action={formAction} className="flex flex-col gap-4 border-t border-border/60 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Reorder Level" htmlFor="reorderLevel" hint="Admin low-stock alert trigger.">
              <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={reorderLevel} />
            </FormField>
            <FormField label="Low Stock Threshold" htmlFor="lowStockThreshold" hint="Customer-facing 'Low Stock' label.">
              <Input id="lowStockThreshold" name="lowStockThreshold" type="number" min={0} defaultValue={lowStockThreshold} />
            </FormField>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Checkbox name="allowBackorder" defaultChecked={allowBackorder} />
            <span>Allow orders when out of stock (backorder)</span>
          </label>
          {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}
          <Button type="submit" size="sm" disabled={pending} className="self-start">
            {pending ? "Saving…" : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
