import { Coins, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { StoreSettingsFormValues } from "./store-settings-form";

export function CommerceTaxSection({
  settings,
  pending = false,
}: Readonly<{
  settings: StoreSettingsFormValues;
  pending?: boolean;
}>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-warning-700 dark:text-warning-200" />
          <div>
            <CardTitle>Currency & Tax Parameters</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Set store billing currency and Kenya VAT computation rules applied across products and checkout totals.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Store Currency" htmlFor="currency" hint="Single-currency store (KES by default).">
            <Input id="currency" name="currency" defaultValue={settings.currency} maxLength={10} required />
          </FormField>
          <FormField label="VAT Rate (%)" htmlFor="vatRate" hint="Standard Kenya VAT rate is 16%.">
            <Input id="vatRate" name="vatRate" type="number" min={0} max={100} step="0.01" defaultValue={settings.vatRate} required />
          </FormField>
        </div>

        <div className="rounded-xl border border-border/70 bg-neutral-50/60 dark:bg-neutral-900/30 p-4">
          <label className="flex items-start gap-3 text-sm font-medium text-foreground cursor-pointer select-none">
            <Checkbox name="pricesIncludeVat" defaultChecked={settings.pricesIncludeVat} className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span>Storefront and catalog prices already include VAT</span>
              <span className="text-xs text-neutral-500 font-normal">
                When enabled, listed product prices are tax-inclusive. Invoices and receipts will calculate the VAT breakdown from the total.
              </span>
            </div>
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-6 py-4">
        <p className="text-xs text-neutral-500">
          Tax updates recalculate newly generated orders and quotation estimates immediately.
        </p>
        <Button type="submit" disabled={pending} size="sm" className="gap-1.5 font-bold shadow-2xs shrink-0">
          {pending ? (
            <>
              <Spinner className="h-4 w-4" />
              <span>Saving Changes…</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Store Settings</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
