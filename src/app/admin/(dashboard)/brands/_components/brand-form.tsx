"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

type FormState = { error: string } | undefined;

export interface BrandFormValues {
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  countryOfOrigin: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface BrandFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: BrandFormValues;
}

/** Shared by /admin/brands/new and /admin/brands/[id]/edit. */
export function BrandForm({ action, initialValues }: Readonly<BrandFormProps>) {
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
          <FormField label="Logo URL" htmlFor="logoUrl">
            <Input id="logoUrl" name="logoUrl" defaultValue={initialValues?.logoUrl ?? undefined} placeholder="https://..." />
          </FormField>
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={initialValues?.description ?? undefined} rows={3} />
          </FormField>
          <FormField label="Country of origin" htmlFor="countryOfOrigin">
            <Input id="countryOfOrigin" name="countryOfOrigin" defaultValue={initialValues?.countryOfOrigin ?? undefined} />
          </FormField>
          <FormField label="Official website" htmlFor="websiteUrl">
            <Input id="websiteUrl" name="websiteUrl" defaultValue={initialValues?.websiteUrl ?? undefined} placeholder="https://..." />
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
        </CardContent>
      </Card>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save brand"}
        </Button>
        <Link href="/admin/brands" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
