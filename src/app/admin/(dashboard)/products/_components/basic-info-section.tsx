import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";
import { Package } from "lucide-react";

export interface BasicInfoValues {
  name: string;
  slug: string;
  sku: string;
  model: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  categoryId: string;
  brandId: string | null;
}

export function BasicInfoSection({
  initialValues,
  categories,
  brands,
}: Readonly<{
  initialValues?: BasicInfoValues;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <CardTitle>Basic Product Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <FormField label="Product Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={initialValues?.name} placeholder="e.g. Sunsynk 5kW Hybrid Inverter" required />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="URL Slug" htmlFor="slug" hint="Leave blank to auto-generate.">
            <Input id="slug" name="slug" defaultValue={initialValues?.slug} placeholder="e.g. sunsynk-5kw-hybrid" />
          </FormField>
          <FormField label="Stock Keeping Unit (SKU)" htmlFor="sku">
            <Input id="sku" name="sku" defaultValue={initialValues?.sku} placeholder="e.g. INV-SUN-5K" required />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Equipment Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId ?? ""} required>
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Brand / Manufacturer" htmlFor="brandId">
            <Select id="brandId" name="brandId" defaultValue={initialValues?.brandId ?? ""}>
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Model Number" htmlFor="model">
            <Input id="model" name="model" defaultValue={initialValues?.model ?? undefined} placeholder="e.g. SY-5K-24V" />
          </FormField>
        </div>

        <FormField label="Short Storefront Summary" htmlFor="shortDescription">
          <Textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={initialValues?.shortDescription ?? undefined}
            rows={2}
            placeholder="Key selling points shown on search & catalog listing cards..."
          />
        </FormField>

        <FormField label="Full Technical Description" htmlFor="fullDescription">
          <Textarea
            id="fullDescription"
            name="fullDescription"
            defaultValue={initialValues?.fullDescription ?? undefined}
            rows={5}
            placeholder="Detailed features, output ratings, battery compatibility & operating parameters..."
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
