"use client";

import { useActionState } from "react";
import { PackagePlus, PackageMinus, ClipboardList, Undo2, Unlock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  receiveStock,
  recordDamagedStock,
  recordLostStock,
  recordSupplierReturn,
  recordStockCount,
  releaseReservationManually,
} from "@/modules/inventory/admin-actions";

export interface InventoryActionsProps {
  productId: string;
  reservedQuantity: number;
}

export function InventoryActions({ productId, reservedQuantity }: Readonly<InventoryActionsProps>) {
  return (
    <div className="flex flex-col gap-6">
      <ReceiveStockCard productId={productId} />
      <StockCountCard productId={productId} />
      <DamageLossCard productId={productId} />
      {reservedQuantity > 0 && <ReleaseReservationCard productId={productId} reservedQuantity={reservedQuantity} />}
    </div>
  );
}

function ReceiveStockCard({ productId }: Readonly<{ productId: string }>) {
  const [state, formAction, pending] = useActionState(receiveStock.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PackagePlus className="h-4 w-4 text-success-700 dark:text-success-200" />
          <CardTitle>Receive Stock</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          <FormField label="Quantity Received" htmlFor="receive-quantity">
            <Input id="receive-quantity" name="quantity" type="number" min={1} required />
          </FormField>
          <FormField label="Reference (optional)" htmlFor="receive-reference" hint="Delivery note, PO number, supplier invoice, etc.">
            <Input id="receive-reference" name="reference" />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="receive-reason">
            <Input id="receive-reason" name="reason" />
          </FormField>
          {state?.error && <p className="text-xs text-danger-600">{state.error}</p>}
          <Button type="submit" size="sm" disabled={pending} className="self-start">
            {pending ? "Recording…" : "Record Receipt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function StockCountCard({ productId }: Readonly<{ productId: string }>) {
  const [state, formAction, pending] = useActionState(recordStockCount.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-brand-600" />
          <CardTitle>Stock Count</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          <FormField label="Physically Counted Quantity" htmlFor="count-quantity">
            <Input id="count-quantity" name="countedQuantity" type="number" min={0} required />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="count-reason">
            <Input id="count-reason" name="reason" />
          </FormField>
          {state?.error && <p className="text-xs text-danger-600">{state.error}</p>}
          <Button type="submit" size="sm" disabled={pending} className="self-start">
            {pending ? "Saving…" : "Save Count"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DamageLossCard({ productId }: Readonly<{ productId: string }>) {
  const [damageState, damageFormAction, damagePending] = useActionState(recordDamagedStock.bind(null, productId), undefined);
  const [lossState, lossFormAction, lossPending] = useActionState(recordLostStock.bind(null, productId), undefined);
  const [returnState, returnFormAction, returnPending] = useActionState(recordSupplierReturn.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PackageMinus className="h-4 w-4 text-danger-700 dark:text-danger-200" />
          <CardTitle>Damage, Loss & Supplier Returns</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form action={damageFormAction} className="flex flex-col gap-2 border-b border-border/60 pb-4">
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Damaged Stock</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
            <Input name="quantity" type="number" min={1} placeholder="Quantity" required />
            <Input name="reason" placeholder="Reason (required)" required />
          </div>
          {damageState?.error && <p className="text-xs text-danger-600">{damageState.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={damagePending} className="self-start">
            {damagePending ? "Recording…" : "Record Damage"}
          </Button>
        </form>

        <form action={lossFormAction} className="flex flex-col gap-2 border-b border-border/60 pb-4">
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Lost Stock</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
            <Input name="quantity" type="number" min={1} placeholder="Quantity" required />
            <Input name="reason" placeholder="Reason (required)" required />
          </div>
          {lossState?.error && <p className="text-xs text-danger-600">{lossState.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={lossPending} className="self-start">
            {lossPending ? "Recording…" : "Record Loss"}
          </Button>
        </form>

        <form action={returnFormAction} className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">
            <Undo2 className="h-3 w-3" />
            Return to Supplier
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
            <Input name="quantity" type="number" min={1} placeholder="Quantity" required />
            <Input name="reason" placeholder="Reason (required)" required />
          </div>
          {returnState?.error && <p className="text-xs text-danger-600">{returnState.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={returnPending} className="self-start">
            {returnPending ? "Recording…" : "Record Supplier Return"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReleaseReservationCard({ productId, reservedQuantity }: Readonly<{ productId: string; reservedQuantity: number }>) {
  const [state, formAction, pending] = useActionState(releaseReservationManually.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Unlock className="h-4 w-4 text-warning-700 dark:text-warning-200" />
          <CardTitle>Release Stuck Reservation</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">{reservedQuantity} unit(s) currently reserved.</p>
          <FormField label="Quantity to Release" htmlFor="release-quantity">
            <Input id="release-quantity" name="quantity" type="number" min={1} max={reservedQuantity} required />
          </FormField>
          <FormField label="Reason" htmlFor="release-reason">
            <Textarea id="release-reason" name="reason" rows={2} placeholder="Why this reservation is being released manually" required />
          </FormField>
          {state?.error && <p className="text-xs text-danger-600">{state.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={pending} className="self-start">
            {pending ? "Releasing…" : "Release Reservation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
