import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

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

/** First section of the product form — see CLAUDE.md §5.1 for why this form is split into one file per section. */
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
    <Card>
      <CardHeader>
        <CardTitle>Basic information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={initialValues?.name} required />
        </FormField>
        <FormField label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
          <Input id="slug" name="slug" defaultValue={initialValues?.slug} placeholder="auto-generated" />
        </FormField>
        <FormField label="SKU" htmlFor="sku">
          <Input id="sku" name="sku" defaultValue={initialValues?.sku} required />
        </FormField>
        <FormField label="Model number" htmlFor="model">
          <Input id="model" name="model" defaultValue={initialValues?.model ?? undefined} />
        </FormField>
        <FormField label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId ?? ""} required>
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Brand" htmlFor="brandId">
          <Select id="brandId" name="brandId" defaultValue={initialValues?.brandId ?? ""}>
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Short description" htmlFor="shortDescription">
          <Textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={initialValues?.shortDescription ?? undefined}
            rows={2}
          />
        </FormField>
        <FormField label="Full description" htmlFor="fullDescription">
          <Textarea
            id="fullDescription"
            name="fullDescription"
            defaultValue={initialValues?.fullDescription ?? undefined}
            rows={5}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
