import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { DollarSign } from "lucide-react";

export interface PricingValues {
  sellingPrice: number;
  previousPrice: number | null;
  costPrice: number | null;
  isQuotationOnly: boolean;
  hidePrice: boolean;
}

export function PricingSection({ initialValues }: Readonly<{ initialValues?: PricingValues }>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-success-700 dark:text-success-200" />
          <CardTitle>Pricing & Financials</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <FormField label="Selling Price (KES)" htmlFor="sellingPrice">
          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.sellingPrice}
            placeholder="0.00"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Previous Price (KES)" htmlFor="previousPrice" hint="Strikethrough list price.">
            <Input
              id="previousPrice"
              name="previousPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialValues?.previousPrice ?? undefined}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Cost Price (KES)" htmlFor="costPrice" hint="Internal margin tracking.">
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialValues?.costPrice ?? undefined}
              placeholder="0.00"
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface-muted/30 p-3.5 pt-2">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox name="isQuotationOnly" defaultChecked={initialValues?.isQuotationOnly ?? false} />
            <span>Quotation Only (Hide Direct Add-To-Cart)</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox name="hidePrice" defaultChecked={initialValues?.hidePrice ?? false} />
            <span>Hide Price on Storefront (&quot;Contact for Sizing&quot;)</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
