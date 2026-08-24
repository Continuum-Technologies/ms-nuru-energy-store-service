import { Bell, Globe, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { StoreSettingsFormValues } from "./store-settings-form";

export function NotificationsSeoSection({
  settings,
  pending = false,
}: Readonly<{
  settings: StoreSettingsFormValues;
  pending?: boolean;
}>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <div>
            <CardTitle>Notifications, Inventory Thresholds & SEO</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure alert recipients, default re-order safety thresholds, and global search engine metadata.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Order & Quotation Alert Emails"
            htmlFor="orderNotificationEmails"
            hint="Comma-separated emails notified on new customer orders and quotations."
          >
            <Input
              id="orderNotificationEmails"
              name="orderNotificationEmails"
              defaultValue={settings.orderNotificationEmails ?? undefined}
              placeholder="owner@nuruenergy.co.ke, sales@nuruenergy.co.ke"
            />
          </FormField>

          <FormField
            label="Default Low-Stock Threshold"
            htmlFor="lowStockThresholdDefault"
            hint="Applied to newly tracked inventory items unless overridden per product."
          >
            <Input
              id="lowStockThresholdDefault"
              name="lowStockThresholdDefault"
              type="number"
              min={0}
              defaultValue={settings.lowStockThresholdDefault}
              required
            />
          </FormField>
        </div>

        <div className="border-t border-border/50 pt-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <div>
              <span className="text-sm font-semibold text-foreground">Search Engine Optimization (SEO) Defaults</span>
              <p className="text-xs text-neutral-500">Fallback metadata applied to storefront pages when custom meta tags are omitted.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="SEO Title Suffix"
              htmlFor="seoTitleSuffix"
              hint="Appended to auto-generated page titles (e.g. “Inverters | Nuru Energy”)."
            >
              <Input
                id="seoTitleSuffix"
                name="seoTitleSuffix"
                defaultValue={settings.seoTitleSuffix ?? undefined}
                placeholder=" | Nuru Energy Kenya"
              />
            </FormField>

            <FormField
              label="Default Meta Description"
              htmlFor="seoDefaultDescription"
              hint="Fallback description shown in Google search result previews."
            >
              <Input
                id="seoDefaultDescription"
                name="seoDefaultDescription"
                defaultValue={settings.seoDefaultDescription ?? undefined}
                placeholder="Kenya's leading retailer of solar panels, lithium batteries, hybrid inverters, and clean power equipment."
              />
            </FormField>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-6 py-4">
        <p className="text-xs text-neutral-500">
          SEO updates automatically revalidate cached search metadata and social share cards.
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
