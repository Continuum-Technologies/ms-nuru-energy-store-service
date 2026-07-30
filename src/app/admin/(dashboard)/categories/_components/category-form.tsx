"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

type FormState = { error: string } | undefined;

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
}

export interface CategoryFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  /** Candidate parent options — the category being edited (and its descendants) should already be excluded by the caller. */
  parentOptions: { id: string; name: string }[];
  initialValues?: CategoryFormValues;
}

/** Shared by /admin/categories/new and /admin/categories/[id]/edit. */
export function CategoryForm({ action, parentOptions, initialValues }: Readonly<CategoryFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
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
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={initialValues?.description ?? undefined} rows={3} />
          </FormField>
          <FormField label="Image URL" htmlFor="imageUrl">
            <Input id="imageUrl" name="imageUrl" defaultValue={initialValues?.imageUrl ?? undefined} placeholder="https://..." />
          </FormField>
          <FormField label="Parent category" htmlFor="parentId">
            <Select id="parentId" name="parentId" defaultValue={initialValues?.parentId ?? ""}>
              <option value="">None (top-level)</option>
              {parentOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Display order" htmlFor="displayOrder">
            <Input id="displayOrder" name="displayOrder" type="number" defaultValue={initialValues?.displayOrder ?? 0} />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="isActive" defaultChecked={initialValues?.isActive ?? true} />
            Active (visible on the storefront)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="isFeatured" defaultChecked={initialValues?.isFeatured ?? false} />
            Featured on homepage
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField label="SEO title" htmlFor="seoTitle">
            <Input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? undefined} />
          </FormField>
          <FormField label="Meta description" htmlFor="seoDescription">
            <Textarea id="seoDescription" name="seoDescription" defaultValue={initialValues?.seoDescription ?? undefined} rows={2} />
          </FormField>
          <FormField label="Search keywords" htmlFor="seoKeywords">
            <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues?.seoKeywords ?? undefined} />
          </FormField>
          <FormField label="Canonical URL" htmlFor="canonicalUrl">
            <Input id="canonicalUrl" name="canonicalUrl" defaultValue={initialValues?.canonicalUrl ?? undefined} />
          </FormField>
        </CardContent>
      </Card>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save category"}
        </Button>
        <Link href="/admin/categories" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
