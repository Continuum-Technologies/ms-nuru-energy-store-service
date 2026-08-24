"use client";

import { useActionState, useRef, useState } from "react";
import { ShieldAlert, Check, CheckCircle2, Smartphone, Landmark, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { updatePaymentDisplaySettings } from "@/modules/settings/actions";

export interface PaymentDetailsSettings {
  mpesaPaybill: string | null;
  mpesaTill: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
}

/**
 * Owner-only ("payments.settings.manage" — see src/lib/permissions.ts).
 * A separate form/permission from the rest of Settings, per PRD §29's
 * "critical settings should be protected by additional confirmation" — the
 * confirmation is this Dialog step; the restricted permission is enforced
 * server-side in updatePaymentDisplaySettings regardless of what renders here.
 */
export function PaymentDetailsSection({ settings }: Readonly<{ settings: PaymentDetailsSettings }>) {
  const [state, formAction, pending] = useActionState(updatePaymentDisplaySettings, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<DialogHandle>(null);

  // Live state for customer preview
  const [paybill, setPaybill] = useState(settings.mpesaPaybill ?? "");
  const [till, setTill] = useState(settings.mpesaTill ?? "");
  const [bankName, setBankName] = useState(settings.bankName ?? "");
  const [bankAccountName, setBankAccountName] = useState(settings.bankAccountName ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber ?? "");
  const [bankBranch, setBankBranch] = useState(settings.bankBranch ?? "");

  return (
    <Card id="payment-credentials" className="shadow-2xs border-warning-200 dark:border-warning-900 scroll-mt-32">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning-700 dark:text-warning-200" />
            <div>
              <CardTitle>Manual Payment Credentials & Checkout Instructions</CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Restricted to Owner. These credentials are presented to buyers choosing manual M-Pesa or Bank Transfer at checkout.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-6">
        {state?.success && (
          <output
            className="flex items-center gap-2.5 rounded-control border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-950/40 dark:text-success-300"
          >
            <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400 shrink-0" />
            <span>Payment details updated and saved successfully.</span>
          </output>
        )}

        <form ref={formRef} action={formAction} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Form Inputs Column */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-2">
                <Smartphone className="h-4 w-4 text-success-700 dark:text-success-400" />
                <span>M-Pesa Credentials</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="M-Pesa Paybill Number"
                  htmlFor="mpesaPaybill"
                  hint="5 to 7 digits business number."
                >
                  <Input
                    id="mpesaPaybill"
                    name="mpesaPaybill"
                    value={paybill}
                    onChange={(e) => setPaybill(e.target.value)}
                    placeholder="e.g. 522522"
                  />
                </FormField>
                <FormField
                  label="M-Pesa Till / Buy Goods Number"
                  htmlFor="mpesaTill"
                  hint="6 to 7 digits merchant Till number."
                >
                  <Input
                    id="mpesaTill"
                    name="mpesaTill"
                    value={till}
                    onChange={(e) => setTill(e.target.value)}
                    placeholder="e.g. 987654"
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/40 pb-2 pt-2">
                <Landmark className="h-4 w-4 text-info-700 dark:text-info-300" />
                <span>Bank Transfer Details</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Bank Name" htmlFor="bankName">
                  <Input
                    id="bankName"
                    name="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. NCBA Bank Kenya"
                  />
                </FormField>
                <FormField label="Bank Branch" htmlFor="bankBranch">
                  <Input
                    id="bankBranch"
                    name="bankBranch"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="e.g. Upper Hill Branch"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Bank Account Name" htmlFor="bankAccountName">
                  <Input
                    id="bankAccountName"
                    name="bankAccountName"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="e.g. Nuru Energy Kenya Ltd"
                  />
                </FormField>
                <FormField label="Bank Account Number" htmlFor="bankAccountNumber">
                  <Input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 1002345678"
                  />
                </FormField>
              </div>
            </div>

            {/* Live Customer Preview Column */}
            <div className="flex flex-col gap-3 lg:col-span-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Eye className="h-3.5 w-3.5" />
                <span>Customer Checkout Preview</span>
              </div>

              <div className="rounded-xl border border-border/70 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 flex flex-col gap-4 text-xs">
                {/* M-Pesa Preview Card */}
                <div className="rounded-lg border border-border/60 bg-surface p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Smartphone className="h-4 w-4 text-success-700 dark:text-success-400" />
                    <span>Lipa na M-Pesa Instructions</span>
                  </div>
                  <div className="mt-2 space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                    {paybill ? (
                      <p>• Paybill: <span className="font-bold text-foreground">{paybill}</span> | Acc: <span className="font-bold text-foreground">ORDER-1001</span></p>
                    ) : null}
                    {till ? (
                      <p>• Till / Buy Goods: <span className="font-bold text-foreground">{till}</span></p>
                    ) : null}
                    {!paybill && !till && (
                      <p className="text-neutral-400 font-sans italic">No M-Pesa credentials configured.</p>
                    )}
                  </div>
                </div>

                {/* Bank Transfer Preview Card */}
                <div className="rounded-lg border border-border/60 bg-surface p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Landmark className="h-4 w-4 text-info-700 dark:text-info-300" />
                    <span>Bank Transfer Instructions</span>
                  </div>
                  <div className="mt-2 space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                    {bankName || bankAccountNumber ? (
                      <>
                        <p><span className="font-medium text-foreground">Bank:</span> {bankName || "—"}</p>
                        <p><span className="font-medium text-foreground">Account Name:</span> {bankAccountName || "—"}</p>
                        <p><span className="font-medium text-foreground">Account No:</span> <span className="font-mono font-bold text-foreground">{bankAccountNumber || "—"}</span></p>
                        <p><span className="font-medium text-foreground">Branch:</span> {bankBranch || "—"}</p>
                      </>
                    ) : (
                      <p className="text-neutral-400 italic">No bank account details configured.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {state?.error && (
            <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-300">
              {state.error}
            </div>
          )}

          <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-6 py-4 -mx-6 -mb-6 mt-2 rounded-b-card">
            <p className="text-xs text-neutral-500">
              Owner-restricted setting. Changes require confirmation before updating active checkout payment options.
            </p>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 font-bold shadow-2xs shrink-0"
              disabled={pending}
              onClick={() => dialogRef.current?.open()}
            >
              {pending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  <span>Saving Payment Details…</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Payment Details</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>

      <Dialog ref={dialogRef} title="Update payment credentials?">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          These details are shown immediately to customers at checkout for manual M-Pesa and Bank Transfer payments. Confirm you want
          to save these changes to avoid disrupting incoming customer payments.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              dialogRef.current?.close();
              formRef.current?.requestSubmit();
            }}
          >
            Confirm & Save
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
