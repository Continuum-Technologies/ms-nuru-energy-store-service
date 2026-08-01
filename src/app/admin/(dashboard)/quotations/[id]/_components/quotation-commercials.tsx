"use client";

import { useActionState, useState } from "react";
import { Calculator, FileSignature, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import { updateQuotationCommercials } from "@/modules/quotations/admin-actions";

export interface QuotationCommercialsProps {
  quotationId: string;
  subtotal: number | null;
  discountTotal: number | null;
  installationCharge: number | null;
  deliveryCharge: number | null;
  taxTotal: number | null;
  total: number | null;
  termsAndConditions: string | null;
  paymentTerms: string | null;
  warrantyInfo: string | null;
  expiresAt: Date | null;
  editable: boolean;
}

function dateInputValue(date: Date | null): string {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

export function QuotationCommercials({
  quotationId,
  subtotal,
  discountTotal,
  installationCharge,
  deliveryCharge,
  taxTotal,
  total,
  termsAndConditions,
  paymentTerms,
  warrantyInfo,
  expiresAt,
  editable,
}: Readonly<QuotationCommercialsProps>) {
  const [state, formAction, pending] = useActionState(updateQuotationCommercials.bind(null, quotationId), undefined);

  // Live financial preview calculations
  const [discountVal, setDiscountVal] = useState<number>(discountTotal ?? 0);
  const [installVal, setInstallVal] = useState<number>(installationCharge ?? 0);
  const [deliveryVal, setDeliveryVal] = useState<number>(deliveryCharge ?? 0);
  const [taxVal, setTaxVal] = useState<number>(taxTotal ?? 0);

  const currentSubtotal = subtotal ?? 0;
  const computedTotal = currentSubtotal - discountVal + installVal + deliveryVal + taxVal;

  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-base font-extrabold">Commercial Terms & Financial Breakdown</CardTitle>
              <span className="text-xs text-neutral-500">Configure quote validity, payment structure, and additional fees</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-50/40 dark:bg-brand-600/10 px-3 py-1.5">
            <span className="text-xs font-bold text-neutral-500">Grand Total:</span>
            <span className="font-mono text-base font-black text-brand-600 dark:text-brand-400">
              {formatKes(editable ? computedTotal : (total ?? 0))}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Section: Commercial Terms & Terms of Sale */}
            <div className="flex flex-col gap-4 lg:col-span-7 border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0">
              <div className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
                <FileSignature className="h-3.5 w-3.5 text-brand-600" />
                <span>Commercial Terms & Warranty</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Quote Validity Expiry" htmlFor="expiresAt">
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    defaultValue={dateInputValue(expiresAt)}
                    disabled={!editable}
                  />
                </FormField>
                <FormField label="Warranty Coverage" htmlFor="warrantyInfo">
                  <Input
                    id="warrantyInfo"
                    name="warrantyInfo"
                    defaultValue={warrantyInfo ?? ""}
                    placeholder="e.g. 2-Year Full Equipment & Workmanship Warranty"
                    disabled={!editable}
                  />
                </FormField>
              </div>

              <FormField label="Payment Milestone & Terms" htmlFor="paymentTerms">
                <Textarea
                  id="paymentTerms"
                  name="paymentTerms"
                  rows={2}
                  defaultValue={paymentTerms ?? ""}
                  placeholder="e.g. 60% Deposit upon approval, 40% upon commissioning"
                  disabled={!editable}
                />
              </FormField>

              <FormField label="Terms & Special Conditions" htmlFor="termsAndConditions">
                <Textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  rows={3}
                  defaultValue={termsAndConditions ?? ""}
                  placeholder="e.g. Delivery included within Nairobi Metro. Site access required for installation team."
                  disabled={!editable}
                />
              </FormField>
            </div>

            {/* Right Section: Additional Charges & Financial Breakdown */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
                <Calculator className="h-3.5 w-3.5 text-brand-600" />
                <span>Financial Adjustment & Fees</span>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-muted/30 p-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                  <span className="text-neutral-500 font-medium">Equipment Subtotal</span>
                  <span className="font-mono font-bold text-foreground">{formatKes(currentSubtotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Discount (KES)" htmlFor="discountTotal">
                    <Input
                      id="discountTotal"
                      name="discountTotal"
                      type="number"
                      min={0}
                      step="0.01"
                      value={discountVal}
                      onChange={(e) => setDiscountVal(Number(e.target.value))}
                      disabled={!editable}
                    />
                  </FormField>
                  <FormField label="Installation Fee" htmlFor="installationCharge">
                    <Input
                      id="installationCharge"
                      name="installationCharge"
                      type="number"
                      min={0}
                      step="0.01"
                      value={installVal}
                      onChange={(e) => setInstallVal(Number(e.target.value))}
                      disabled={!editable}
                    />
                  </FormField>
                  <FormField label="Freight / Delivery" htmlFor="deliveryCharge">
                    <Input
                      id="deliveryCharge"
                      name="deliveryCharge"
                      type="number"
                      min={0}
                      step="0.01"
                      value={deliveryVal}
                      onChange={(e) => setDeliveryVal(Number(e.target.value))}
                      disabled={!editable}
                    />
                  </FormField>
                  <FormField label="VAT Tax (KES)" htmlFor="taxTotal">
                    <Input
                      id="taxTotal"
                      name="taxTotal"
                      type="number"
                      min={0}
                      step="0.01"
                      value={taxVal}
                      onChange={(e) => setTaxVal(Number(e.target.value))}
                      disabled={!editable}
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-between border-t border-border/80 pt-3 mt-1">
                  <span className="text-xs font-extrabold text-foreground">Final Net Total</span>
                  <span className="font-mono text-base font-black text-brand-600 dark:text-brand-400">
                    {formatKes(computedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {state?.error && <p className="text-xs font-semibold text-danger-600">{state.error}</p>}

          {editable && (
            <div className="flex items-center justify-end border-t border-border/60 pt-4">
              <Button type="submit" size="md" disabled={pending} className="gap-2 font-bold px-6">
                <Save className="h-4 w-4" />
                {pending ? "Saving Terms & Commercials…" : "Save Terms & Commercial Breakdown"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
