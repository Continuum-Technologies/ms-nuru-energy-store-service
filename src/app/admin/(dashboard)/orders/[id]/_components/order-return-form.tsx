"use client";

import { useActionState } from "react";
import { Undo2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { processCustomerReturn } from "@/modules/inventory/returns";

export interface OrderReturnFormItem {
  id: string;
  productName: string;
  quantity: number;
}

/** Only rendered when the order is DELIVERED/COMPLETED — goods must have actually gone out to come back. Per line, defaults to 0 (not returned); staff enter how many of each are being returned. */
export function OrderReturnForm({ orderId, items }: Readonly<{ orderId: string; items: OrderReturnFormItem[] }>) {
  const [state, formAction, pending] = useActionState(processCustomerReturn.bind(null, orderId), undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Undo2 className="h-4 w-4 text-brand-600" />
          <CardTitle>Process a Return</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-border/60">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.productName}</span>
                  <span className="text-xs text-neutral-500">Ordered qty {item.quantity}</span>
                </div>
                <Input
                  name={`qty_${item.id}`}
                  type="number"
                  min={0}
                  max={item.quantity}
                  defaultValue={0}
                  className="w-20 text-center"
                  aria-label={`Return quantity for ${item.productName}`}
                />
              </div>
            ))}
          </div>

          <Textarea name="reason" rows={2} placeholder="Reason for the return (required)" required />

          {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}

          <Button type="submit" size="sm" disabled={pending} className="self-start">
            {pending ? "Processing…" : "Process Return"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
