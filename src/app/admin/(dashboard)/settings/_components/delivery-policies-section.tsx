import { Truck, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { StoreSettingsFormValues } from "./store-settings-form";

export function DeliveryPoliciesSection({
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
          <Truck className="h-4 w-4 text-info-700 dark:text-info-200" />
          <div>
            <CardTitle>Delivery, Collection & Policy Summaries</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Standard fulfilment terms, warranties, return policies, and default quotation terms presented to buyers.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Delivery Information" htmlFor="deliveryInfo" hint="Shown at checkout step and on product pages.">
            <Textarea
              id="deliveryInfo"
              name="deliveryInfo"
              defaultValue={settings.deliveryInfo ?? undefined}
              rows={3}
              placeholder="Countrywide delivery within 2-5 business days via regional courier hubs..."
            />
          </FormField>
          <FormField label="Collection Information" htmlFor="collectionInfo" hint="Pickup instructions for in-store collection orders.">
            <Textarea
              id="collectionInfo"
              name="collectionInfo"
              defaultValue={settings.collectionInfo ?? undefined}
              rows={3}
              placeholder="Store collection available Mon–Sat at our Nairobi central hub..."
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Warranty Policy Summary" htmlFor="warrantyPolicySummary" hint="Brief summary for product badges and quotation summaries.">
            <Textarea
              id="warrantyPolicySummary"
              name="warrantyPolicySummary"
              defaultValue={settings.warrantyPolicySummary ?? undefined}
              rows={3}
              placeholder="Manufacturer warranty applies on solar panels, inverters, and battery systems..."
            />
          </FormField>
          <FormField label="Return Policy Summary" htmlFor="returnPolicySummary" hint="Return window and conditions summary.">
            <Textarea
              id="returnPolicySummary"
              name="returnPolicySummary"
              defaultValue={settings.returnPolicySummary ?? undefined}
              rows={3}
              placeholder="Returns accepted within 7 days for unopened and verified defective equipment..."
            />
          </FormField>
        </div>

        <FormField
          label="Default Quotation Terms"
          htmlFor="quotationTermsDefault"
          hint="Seeds new quotations' terms & conditions field — editable per individual quotation."
        >
          <Textarea
            id="quotationTermsDefault"
            name="quotationTermsDefault"
            defaultValue={settings.quotationTermsDefault ?? undefined}
            rows={4}
            placeholder="1. Quotation valid for 14 days from date of issue.&#10;2. Payment terms: 50% deposit upon order confirmation.&#10;3. Equipment remains property of Nuru Energy until paid in full."
          />
        </FormField>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-6 py-4">
        <p className="text-xs text-neutral-500">
          Full legal policy pages are managed under Website Content &gt; Manage Pages.
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
