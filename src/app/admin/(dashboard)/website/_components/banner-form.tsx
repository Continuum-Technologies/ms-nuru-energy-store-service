"use client";

import { useActionState, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, ImageIcon, Check, ArrowLeft, Layout } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

type FormState = { error: string } | undefined;

export interface BannerFormValues {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

/** `datetime-local` needs "YYYY-MM-DDTHH:mm", not a full ISO string with seconds/timezone. */
function toDatetimeLocal(value: string | null): string | undefined {
  return value ? value.slice(0, 16) : undefined;
}

export interface BannerFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: BannerFormValues;
  cancelHref?: string;
  submitLabel?: string;
}

export function BannerForm({
  action,
  initialValues,
  cancelHref = "/admin/website",
  submitLabel = "Save banner",
}: Readonly<BannerFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [imageKey, setImageKey] = useState(initialValues?.imageKey ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "banners");
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        setUploadError(result.error ?? "Upload failed.");
        return;
      }
      setImageUrl(result.url);
      setImageKey(result.key);
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imageKey" value={imageKey} />

      <Card className="shadow-2xs">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <CardTitle>Banner Content</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title">
              <Input id="title" name="title" defaultValue={initialValues?.title} required />
            </FormField>
            <FormField label="Subtitle" htmlFor="subtitle">
              <Input id="subtitle" name="subtitle" defaultValue={initialValues?.subtitle ?? undefined} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Call-to-Action Label" htmlFor="ctaLabel">
              <Input id="ctaLabel" name="ctaLabel" defaultValue={initialValues?.ctaLabel ?? undefined} placeholder="e.g. Browse Equipment" />
            </FormField>
            <FormField label="Call-to-Action Link" htmlFor="ctaHref">
              <Input id="ctaHref" name="ctaHref" defaultValue={initialValues?.ctaHref ?? undefined} placeholder="/shop" />
            </FormField>
          </div>

          <FormField label="Banner Image" htmlFor="banner-image-upload">
            <div className="flex flex-col gap-3">
              {imageUrl && (
                <div className="relative aspect-[21/9] w-full max-w-md overflow-hidden rounded-xl border border-border bg-neutral-100">
                  <Image src={imageUrl} alt="Banner preview" fill unoptimized className="object-cover" />
                </div>
              )}
              <input
                ref={inputRef}
                id="banner-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" className="gap-2 self-start" disabled={uploading} onClick={() => inputRef.current?.click()}>
                {imageUrl ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
              </Button>
              {uploadError && <p className="text-sm text-danger-600">{uploadError}</p>}
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Display Order" htmlFor="sortOrder" hint="Lower numbers show first.">
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initialValues?.sortOrder ?? 0} />
            </FormField>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer select-none">
                <Checkbox name="isActive" defaultChecked={initialValues?.isActive ?? true} />
                <span>Active (visible on homepage)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Show From (optional)" htmlFor="startsAt" hint="Leave blank to show immediately.">
              <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toDatetimeLocal(initialValues?.startsAt ?? null)} />
            </FormField>
            <FormField label="Show Until (optional)" htmlFor="endsAt" hint="Leave blank to show indefinitely.">
              <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toDatetimeLocal(initialValues?.endsAt ?? null)} />
            </FormField>
          </div>
        </CardContent>
      </Card>

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
