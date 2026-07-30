import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

export interface DeliveryValues {
  weightKg: number | null;
  dimensions: string | null;
  installationAvailable: boolean;
  installationRequired: boolean;
}

export function DeliverySection({ initialValues }: Readonly<{ initialValues?: DeliveryValues }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery &amp; installation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField label="Weight (kg)" htmlFor="weightKg">
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialValues?.weightKg ?? undefined}
          />
        </FormField>
        <FormField label="Dimensions" htmlFor="dimensions" hint="e.g. 120 x 60 x 4 cm">
          <Input id="dimensions" name="dimensions" defaultValue={initialValues?.dimensions ?? undefined} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="installationAvailable" defaultChecked={initialValues?.installationAvailable ?? false} />
          Installation available
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="installationRequired" defaultChecked={initialValues?.installationRequired ?? false} />
          Installation required
        </label>
      </CardContent>
    </Card>
  );
}
