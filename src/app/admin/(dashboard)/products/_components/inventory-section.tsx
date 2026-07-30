"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";
import { updateProductInventory } from "@/modules/catalog/products/actions";

export interface InventoryValues {
  quantityOnHand: number;
  reorderLevel: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
}

/**
 * Edit-only — a new product has no productId yet to attach stock to. This is
 * a lightweight initial/manual stock-setting form; the dedicated Inventory
 * module (receiving, reservations, damage) comes later.
 */
export function InventorySection({
  productId,
  initialValues,
}: Readonly<{ productId: string; initialValues?: InventoryValues }>) {
  const [state, formAction, pending] = useActionState(updateProductInventory.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormField label="Quantity on hand" htmlFor="quantityOnHand">
            <Input
              id="quantityOnHand"
              name="quantityOnHand"
              type="number"
              min="0"
              defaultValue={initialValues?.quantityOnHand ?? 0}
              required
            />
          </FormField>
          <FormField label="Reorder level" htmlFor="reorderLevel" hint="Below this, the product shows as low stock.">
            <Input id="reorderLevel" name="reorderLevel" type="number" min="0" defaultValue={initialValues?.reorderLevel ?? 0} />
          </FormField>
          <FormField label="Low stock threshold" htmlFor="lowStockThreshold">
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={initialValues?.lowStockThreshold ?? 0}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="allowBackorder" defaultChecked={initialValues?.allowBackorder ?? false} />
            Allow orders when out of stock (backorder)
          </label>
          {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Saving…" : "Save inventory"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
