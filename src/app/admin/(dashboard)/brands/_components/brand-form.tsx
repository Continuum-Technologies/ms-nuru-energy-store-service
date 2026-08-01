"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Factory, ImageIcon, Globe, ArrowLeft, Check } from "lucide-react";

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
  cancelHref?: string;
  submitLabel?: string;
}

export function BrandForm({
  action,
  initialValues,
  cancelHref = "/admin/brands",
  submitLabel = "Save manufacturer",
}: Readonly<BrandFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [logoUrl, setLogoUrl] = useState<string>(initialValues?.logoUrl ?? "");
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Responsive 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (Primary Details) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <CardTitle>Manufacturer Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Brand / Manufacturer Name" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    defaultValue={initialValues?.name}
                    placeholder="e.g. Victron Energy"
                    required
                  />
                </FormField>
                <FormField label="URL Slug" htmlFor="slug" hint="Leave blank to auto-generate.">
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={initialValues?.slug}
                    placeholder="e.g. victron-energy"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Country of Origin" htmlFor="countryOfOrigin">
                  <Input
                    id="countryOfOrigin"
                    name="countryOfOrigin"
                    defaultValue={initialValues?.countryOfOrigin ?? undefined}
                    placeholder="e.g. Netherlands, United Kingdom"
                  />
                </FormField>
                <FormField label="Official Website" htmlFor="websiteUrl">
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    defaultValue={initialValues?.websiteUrl ?? undefined}
                    placeholder="https://..."
                  />
                </FormField>
              </div>

              <FormField label="Manufacturer Profile / Description" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialValues?.description ?? undefined}
                  rows={4}
                  placeholder="Overview of equipment manufactured, engineering standards, and warranty reputation..."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Logo, Visibility & SEO) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Logo & Storefront Visibility Card */}
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-warning-700 dark:text-warning-200" />
                <CardTitle>Brand Logo & Visibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <FormField label="Logo Image URL" htmlFor="logoUrl">
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoLoadFailed(false);
                  }}
                  placeholder="https://..."
                />
              </FormField>

              {/* Logo Preview Box — a load failure only swaps the preview to
                  an error state; it never clears what the owner typed. */}
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface-muted/40 p-4 text-center">
                {logoUrl && !logoLoadFailed ? (
                  <Image
                    src={logoUrl}
                    alt="Brand Logo Preview"
                    width={160}
                    height={96}
                    unoptimized
                    className="max-h-24 w-auto rounded-lg object-contain"
                    onError={() => setLogoLoadFailed(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-3 text-neutral-400">
                    <ImageIcon className="h-8 w-8 stroke-1" />
                    <span className="text-xs">
                      {logoUrl && logoLoadFailed ? "Couldn't load this logo" : "No logo URL provided"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface-muted/30 p-3.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <Checkbox name="isActive" defaultChecked={initialValues?.isActive ?? true} />
                  <span>Active (Visible in Storefront Filter)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <Checkbox name="isFeatured" defaultChecked={initialValues?.isFeatured ?? false} />
                  <span>Featured Partner (Showcase on Homepage)</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Metadata Card */}
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-info-700 dark:text-info-200" />
                <CardTitle>SEO & Metadata</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <FormField label="SEO Title" htmlFor="seoTitle">
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  defaultValue={initialValues?.seoTitle ?? undefined}
                  placeholder="e.g. Victron Energy Products Kenya"
                />
              </FormField>
              <FormField label="Meta Description" htmlFor="seoDescription">
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  defaultValue={initialValues?.seoDescription ?? undefined}
                  rows={2}
                  placeholder="Search engine summary..."
                />
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

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}>
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>
        <Button type="submit" disabled={pending} size="sm" className="gap-1.5 font-bold">
          <Check className="h-4 w-4" />
          {pending ? "Saving Manufacturer…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
