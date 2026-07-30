import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

export interface PricingValues {
  sellingPrice: number;
  previousPrice: number | null;
  costPrice: number | null;
  isQuotationOnly: boolean;
  hidePrice: boolean;
}

export function PricingSection({ initialValues }: Readonly<{ initialValues?: PricingValues }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField label="Selling price (KES)" htmlFor="sellingPrice">
          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.sellingPrice}
            required
          />
        </FormField>
        <FormField label="Previous price (KES)" htmlFor="previousPrice" hint="Shown as a strikethrough price when set.">
          <Input
            id="previousPrice"
            name="previousPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.previousPrice ?? undefined}
          />
        </FormField>
        <FormField label="Cost price (KES)" htmlFor="costPrice" hint="Internal only — never shown to customers.">
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.costPrice ?? undefined}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="isQuotationOnly" defaultChecked={initialValues?.isQuotationOnly ?? false} />
          Quotation only (hide direct add-to-cart)
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="hidePrice" defaultChecked={initialValues?.hidePrice ?? false} />
          Hide price on the storefront (&quot;Contact for pricing&quot;)
        </label>
      </CardContent>
    </Card>
  );
}
