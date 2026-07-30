"use client";

import { useActionState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  createSpecificationTemplate,
  addSpecificationField,
  deleteSpecificationField,
} from "@/modules/catalog/specifications/actions";

interface SpecField {
  id: string;
  label: string;
  unit: string | null;
}

interface SpecTemplate {
  id: string;
  name: string;
  fields: SpecField[];
}

/**
 * Specification templates live on the category edit page, not a separate nav
 * item (CLAUDE.md §12) — a template belongs to exactly one category, and this
 * is where its fields feed the Product form's SpecificationsSection.
 */
export function SpecTemplateSection({
  categoryId,
  template,
}: Readonly<{ categoryId: string; template: SpecTemplate | null }>) {
  if (!template) {
    return <CreateTemplateForm categoryId={categoryId} />;
  }
  return <TemplateFieldsEditor template={template} />;
}

function CreateTemplateForm({ categoryId }: Readonly<{ categoryId: string }>) {
  const [state, formAction, pending] = useActionState(createSpecificationTemplate.bind(null, categoryId), undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specification template</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-neutral-500">
          Define the structured spec fields products in this category should carry (e.g. Rated Power,
          Voltage) — specs are structured data, not free text (CLAUDE.md §4).
        </p>
        <form action={formAction} className="flex items-end gap-2">
          <div className="flex-1">
            <Input name="name" placeholder="e.g. Solar Panel Specifications" required />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create template"}
          </Button>
        </form>
        {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}
      </CardContent>
    </Card>
  );
}

function TemplateFieldsEditor({ template }: Readonly<{ template: SpecTemplate }>) {
  const [state, formAction, pending] = useActionState(addSpecificationField.bind(null, template.id), undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {template.fields.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No fields yet — add the specs products in this category should carry.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-control border border-border">
            {template.fields.map((field) => (
              <li key={field.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-foreground">
                  {field.label}
                  {field.unit && <span className="text-neutral-500"> ({field.unit})</span>}
                </span>
                <form action={deleteSpecificationField.bind(null, field.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="h-7 w-7 p-0 text-danger-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={formAction} className="flex items-end gap-2">
          <div className="flex-1">
            <Input name="label" placeholder="Field label, e.g. Rated Power" required />
          </div>
          <div className="w-32">
            <Input name="unit" placeholder="Unit (W)" />
          </div>
          <Button type="submit" disabled={pending} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add field
          </Button>
        </form>
        {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
