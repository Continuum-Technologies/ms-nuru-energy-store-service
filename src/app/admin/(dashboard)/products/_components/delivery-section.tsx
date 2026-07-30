import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";
import { Truck } from "lucide-react";

export interface DeliveryValues {
  weightKg: number | null;
  dimensions: string | null;
  installationAvailable: boolean;
  installationRequired: boolean;
}

export function DeliverySection({ initialValues }: Readonly<{ initialValues?: DeliveryValues }>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-warning-700 dark:text-warning-200" />
          <CardTitle>Delivery & Installation Requirements</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Weight (kg)" htmlFor="weightKg">
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialValues?.weightKg ?? undefined}
              placeholder="e.g. 24.5"
            />
          </FormField>
          <FormField label="Dimensions (L x W x H)" htmlFor="dimensions" hint="e.g. 172 x 113 x 3.5 cm">
            <Input id="dimensions" name="dimensions" defaultValue={initialValues?.dimensions ?? undefined} placeholder="e.g. 172 x 113 x 3.5 cm" />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface-muted/30 p-3.5 pt-2">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox name="installationAvailable" defaultChecked={initialValues?.installationAvailable ?? false} />
            <span>Professional Installation Available</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox name="installationRequired" defaultChecked={initialValues?.installationRequired ?? false} />
            <span>Mandatory Certified Technician Installation</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
