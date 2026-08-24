"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FileText, Globe, Check, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { PAGE_TYPES } from "@/modules/content/schemas";

type FormState = { error: string } | undefined;

const TYPE_LABEL: Record<(typeof PAGE_TYPES)[number], string> = {
  STATIC: "Static Page (About / Contact)",
  POLICY: "Policy / FAQ",
  SOLUTION: "Solution Page",
};

export interface PageFormValues {
  type: (typeof PAGE_TYPES)[number];
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
}

export interface PageFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: PageFormValues;
  cancelHref?: string;
  submitLabel?: string;
}

export function PageForm({
  action,
  initialValues,
  cancelHref = "/admin/website/pages",
  submitLabel = "Save page",
}: Readonly<PageFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <CardTitle>Page Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Title" htmlFor="title">
                  <Input id="title" name="title" defaultValue={initialValues?.title} required />
                </FormField>
                <FormField label="URL Slug" htmlFor="slug" hint="Leave blank to auto-generate.">
                  <Input id="slug" name="slug" defaultValue={initialValues?.slug} placeholder="e.g. about-us" />
                </FormField>
              </div>

              <FormField label="Page Type" htmlFor="type">
                <Select id="type" name="type" defaultValue={initialValues?.type ?? "POLICY"} required>
                  {PAGE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL[type]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Content (Markdown)" htmlFor="body" hint="Supports headings, bold/italic, links, and lists.">
                <Textarea id="body" name="body" defaultValue={initialValues?.body} rows={16} required className="font-mono text-xs" />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <label className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer select-none">
                <Checkbox name="isPublished" defaultChecked={initialValues?.isPublished ?? false} />
                <span>Published (visible to customers)</span>
              </label>
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-info-700 dark:text-info-200" />
                <CardTitle>SEO & Metadata</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <FormField label="SEO Title" htmlFor="seoTitle">
                <Input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? undefined} />
              </FormField>
              <FormField label="Meta Description" htmlFor="seoDescription">
                <Textarea id="seoDescription" name="seoDescription" defaultValue={initialValues?.seoDescription ?? undefined} rows={2} />
              </FormField>
              <FormField label="Meta Keywords" htmlFor="seoKeywords">
                <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues?.seoKeywords ?? undefined} />
              </FormField>
              <FormField label="Canonical URL" htmlFor="canonicalUrl">
                <Input id="canonicalUrl" name="canonicalUrl" defaultValue={initialValues?.canonicalUrl ?? undefined} />
              </FormField>
            </CardContent>
          </Card>
        </div>
      </div>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}>
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>
        <Button type="submit" disabled={pending} size="sm" className="gap-1.5 font-bold">
          <Check className="h-4 w-4" />
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
