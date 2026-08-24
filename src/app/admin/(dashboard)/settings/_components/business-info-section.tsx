"use client";

import { useState, useRef, useTransition } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Building2, ImageIcon, Upload, Trash2, Globe, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Spinner } from "@/components/ui/spinner";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import type { StoreSettingsFormValues } from "./store-settings-form";

export function BusinessInfoSection({
  settings,
  pending = false,
}: Readonly<{
  settings: StoreSettingsFormValues;
  pending?: boolean;
}>) {
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "settings");

      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        setUploadError(result.error ?? "Failed to upload image.");
        return;
      }

      startTransition(() => {
        setLogoUrl(result.url);
        setLogoLoadFailed(false);
      });
    } catch {
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveLogo() {
    setLogoUrl("");
    setLogoLoadFailed(false);
    setUploadError(null);
  }

  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <CardTitle>Business Identity & Storefront Branding</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        {/* Business Name & Store Logo Upload */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <FormField
              label="Business Name"
              htmlFor="businessName"
              hint="Shown in header, invoices, quotation headers, and footer."
            >
              <Input
                id="businessName"
                name="businessName"
                defaultValue={settings.businessName}
                placeholder="e.g. Nuru Energy"
                required
              />
            </FormField>

            <FormField
              label="Store County"
              htmlFor="county"
              hint="Default dispatch location and primary store headquarters."
            >
              <Select id="county" name="county" defaultValue={settings.county ?? "Nairobi"}>
                <option value="">Select County</option>
                {KENYA_COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Email Address"
              htmlFor="email"
              hint="Customer support and official correspondence."
            >
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email ?? undefined}
                placeholder="info@nuruenergy.co.ke"
              />
            </FormField>
          </div>

          {/* Logo Card & Upload Zone */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Store Logo</span>
            <input type="hidden" name="logoUrl" value={logoUrl} />

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 transition-colors">
              {logoUrl && !logoLoadFailed ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-24 max-w-full items-center justify-center rounded-lg bg-surface p-2 shadow-2xs border border-border/60">
                    <Image
                      src={logoUrl}
                      alt="Store Logo Preview"
                      width={180}
                      height={80}
                      unoptimized
                      className="max-h-20 w-auto object-contain"
                      onError={() => setLogoLoadFailed(true)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Replace Logo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploading}
                      className="gap-1.5 text-xs text-danger-700 hover:text-danger-800 dark:text-danger-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    {uploading ? <Spinner className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {uploading ? (
                      <span className="font-medium text-brand-700 dark:text-brand-300">Uploading to cloud storage…</span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">Click to upload store logo</span>
                        <p className="mt-0.5 text-neutral-400">PNG, JPG, WebP or SVG up to 5MB</p>
                      </>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-1 gap-1.5 text-xs font-semibold"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Browse Image
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            {uploadError && (
              <p className="text-xs text-danger-700 dark:text-danger-200">{uploadError}</p>
            )}

            <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => setShowManualUrl(!showManualUrl)}
                className="text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400"
              >
                {showManualUrl ? "Hide manual URL input" : "Or enter external image URL"}
              </button>
            </div>

            {showManualUrl && (
              <Input
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setLogoLoadFailed(false);
                }}
                placeholder="https://..."
                className="mt-1 text-xs"
              />
            )}
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-border/50 pt-4">
          <FormField
            label="Contact Phone"
            htmlFor="phone"
            hint="Display number for general enquiries & call buttons."
          >
            <PhoneInput
              id="phone"
              name="phone"
              defaultValue={settings.phone ?? undefined}
            />
          </FormField>

          <FormField
            label="WhatsApp Number"
            htmlFor="whatsapp"
            hint="Powers WhatsApp chat floating buttons and quick quotation requests."
          >
            <PhoneInput
              id="whatsapp"
              name="whatsapp"
              defaultValue={settings.whatsapp ?? undefined}
            />
          </FormField>
        </div>

        {/* Location & Hours */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Physical Store Address"
            htmlFor="address"
            hint="Street address, building, or regional pickup hub details."
          >
            <Input
              id="address"
              name="address"
              defaultValue={settings.address ?? undefined}
              placeholder="e.g. Nuru Plaza, Luthuli Avenue, Nairobi"
            />
          </FormField>

          <FormField
            label="Business Hours"
            htmlFor="businessHours"
            hint="Shown on the contact page, quotation PDFs, and footer."
          >
            <Input
              id="businessHours"
              name="businessHours"
              defaultValue={settings.businessHours ?? undefined}
              placeholder="e.g. Mon–Fri 8:00 AM – 5:30 PM, Sat 8:30 AM – 2:00 PM"
            />
          </FormField>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5 pb-3">
            <Globe className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-foreground">Social Media Channels</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Facebook URL" htmlFor="facebookUrl">
              <Input
                id="facebookUrl"
                name="facebookUrl"
                defaultValue={settings.facebookUrl ?? undefined}
                placeholder="https://facebook.com/nuruenergy"
              />
            </FormField>
            <FormField label="Instagram URL" htmlFor="instagramUrl">
              <Input
                id="instagramUrl"
                name="instagramUrl"
                defaultValue={settings.instagramUrl ?? undefined}
                placeholder="https://instagram.com/nuruenergy"
              />
            </FormField>
            <FormField label="TikTok URL" htmlFor="tiktokUrl">
              <Input
                id="tiktokUrl"
                name="tiktokUrl"
                defaultValue={settings.tiktokUrl ?? undefined}
                placeholder="https://tiktok.com/@nuruenergy"
              />
            </FormField>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-6 py-4">
        <p className="text-xs text-neutral-500">
          Displayed across storefront header, invoices, quotation PDFs, and footer.
        </p>
        <Button type="submit" disabled={pending} size="sm" className="gap-1.5 font-bold shadow-2xs shrink-0">
          {pending ? (
            <>
              <Spinner className="h-4 w-4" />
              <span>Saving Changes…</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Store Settings</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
