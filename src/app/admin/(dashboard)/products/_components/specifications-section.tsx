import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

interface SpecField {
  id: string;
  label: string;
  unit: string | null;
}

interface ExistingSpecValue {
  fieldId: string;
  value: string;
}

/**
 * Edit-only. Reads the product's category's specification template (defined
 * on the category edit page — CLAUDE.md §12) and renders one input per field.
 * No template yet → a prompt linking there instead of a form with nothing to
 * fill in.
 */
export function SpecificationsSection({
  action,
  categoryName,
  categoryEditHref,
  fields,
  existingValues,
}: Readonly<{
  action: (formData: FormData) => Promise<void>;
  categoryName: string;
  categoryEditHref: string;
  fields: SpecField[];
  existingValues: ExistingSpecValue[];
}>) {
  const valueByField = new Map(existingValues.map((value) => [value.fieldId, value.value]));

  if (fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            {categoryName} doesn&apos;t have a specification template yet.{" "}
            <a href={categoryEditHref} className="font-medium text-brand-600 hover:underline">
              Add one on the category page
            </a>{" "}
            to capture structured specs for this product.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          {fields.map((field) => (
            <FormField
              key={field.id}
              label={field.unit ? `${field.label} (${field.unit})` : field.label}
              htmlFor={`field:${field.id}`}
            >
              <Input id={`field:${field.id}`} name={`field:${field.id}`} defaultValue={valueByField.get(field.id) ?? ""} />
            </FormField>
          ))}
          <Button type="submit" className="self-start">
            Save specifications
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
