"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FolderTree, ImageIcon, Globe, ArrowLeft, Check } from "lucide-react";

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
  parentOptions: { id: string; name: string }[];
  initialValues?: CategoryFormValues;
  cancelHref?: string;
  submitLabel?: string;
}

export function CategoryForm({
  action,
  parentOptions,
  initialValues,
  cancelHref = "/admin/categories",
  submitLabel = "Save category",
}: Readonly<CategoryFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.imageUrl ?? "");
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Responsive 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (Primary Details & Hierarchy) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <CardTitle>Category Details & Hierarchy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Category Name" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    defaultValue={initialValues?.name}
                    placeholder="e.g. Solar Panels"
                    required
                  />
                </FormField>
                <FormField label="URL Slug" htmlFor="slug" hint="Leave blank to auto-generate.">
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={initialValues?.slug}
                    placeholder="e.g. solar-panels"
                  />
                </FormField>
              </div>

              <FormField label="Parent Category" htmlFor="parentId" hint="Assign to create sub-categories.">
                <Select id="parentId" name="parentId" defaultValue={initialValues?.parentId ?? ""}>
                  <option value="">None (Top-Level Equipment Category)</option>
                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Category Description" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialValues?.description ?? undefined}
                  rows={4}
                  placeholder="Provide an overview of products contained in this equipment category..."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Display, Image & SEO) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Display & Image Preview Card */}
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-warning-700 dark:text-warning-200" />
                <CardTitle>Display & Media</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <FormField label="Category Banner/Image URL" htmlFor="imageUrl">
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageLoadFailed(false);
                  }}
                  placeholder="https://..."
                />
              </FormField>

              {/* Image Preview Box — a load failure only swaps the preview to
                  an error state; it never clears what the owner typed, since
                  a transient network hiccup or a slow-to-load-but-valid URL
                  shouldn't destroy their input. */}
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface-muted/40 p-4 text-center">
                {imageUrl && !imageLoadFailed ? (
                  <Image
                    src={imageUrl}
                    alt="Category Preview"
                    width={200}
                    height={144}
                    unoptimized
                    className="max-h-36 w-auto rounded-lg object-contain"
                    onError={() => setImageLoadFailed(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-4 text-neutral-400">
                    <ImageIcon className="h-8 w-8 stroke-1" />
                    <span className="text-xs">
                      {imageUrl && imageLoadFailed ? "Couldn't load this image" : "No image URL provided"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Display Order" htmlFor="displayOrder">
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    defaultValue={initialValues?.displayOrder ?? 0}
                  />
                </FormField>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface-muted/30 p-3.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <Checkbox name="isActive" defaultChecked={initialValues?.isActive ?? true} />
                  <span>Active (Visible on Storefront)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                  <Checkbox name="isFeatured" defaultChecked={initialValues?.isFeatured ?? false} />
                  <span>Featured on Homepage</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Metadata Card */}
          <Card className="shadow-2xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-info-700 dark:text-info-200" />
                <CardTitle>SEO & Search Metadata</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
              <FormField label="SEO Meta Title" htmlFor="seoTitle">
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  defaultValue={initialValues?.seoTitle ?? undefined}
                  placeholder="e.g. Solar Panels Kenya | Buy Online"
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
              <FormField label="Search Keywords" htmlFor="seoKeywords">
                <Input
                  id="seoKeywords"
                  name="seoKeywords"
                  defaultValue={initialValues?.seoKeywords ?? undefined}
                  placeholder="solar panels, mono solar, photo-voltaic"
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
          {pending ? "Saving Category…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
