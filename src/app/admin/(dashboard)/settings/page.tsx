import { Clock, UserCheck } from "lucide-react";
import { hasPermission, requirePermissionOrRedirect } from "@/lib/permissions";
import { getStoreSettings } from "@/modules/settings/queries";
import { StoreSettingsForm } from "./_components/store-settings-form";

export default async function SettingsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ tab?: string }>;
}>) {
  const user = await requirePermissionOrRedirect("settings.manage");
  const settings = await getStoreSettings();
  const canManagePayments = hasPermission(user.role, "payments.settings.manage");

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedSearchParams?.tab ?? "business-identity";

  const formattedUpdatedAt = new Date(settings.updatedAt).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header with Audit Metadata */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Store Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Configure store branding, tax parameters, delivery terms, notifications, SEO defaults, and payment methods.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs text-neutral-500 shadow-2xs self-start sm:self-auto">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          <span>Last modified: <strong className="font-medium text-foreground">{formattedUpdatedAt}</strong></span>
          {settings.updatedBy?.name && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="inline-flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                <span className="text-foreground">{settings.updatedBy.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <StoreSettingsForm
        initialTab={initialTab}
        canManagePayments={canManagePayments}
        settings={{
          businessName: settings.businessName,
          logoUrl: settings.logoUrl,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          email: settings.email,
          address: settings.address,
          county: settings.county,
          businessHours: settings.businessHours,
          facebookUrl: settings.facebookUrl,
          instagramUrl: settings.instagramUrl,
          tiktokUrl: settings.tiktokUrl,
          currency: settings.currency,
          vatRate: settings.vatRate.toString(),
          pricesIncludeVat: settings.pricesIncludeVat,
          deliveryInfo: settings.deliveryInfo,
          collectionInfo: settings.collectionInfo,
          warrantyPolicySummary: settings.warrantyPolicySummary,
          returnPolicySummary: settings.returnPolicySummary,
          quotationTermsDefault: settings.quotationTermsDefault,
          orderNotificationEmails: settings.orderNotificationEmails,
          lowStockThresholdDefault: settings.lowStockThresholdDefault,
          seoTitleSuffix: settings.seoTitleSuffix,
          seoDefaultDescription: settings.seoDefaultDescription,
        }}
        paymentSettings={
          canManagePayments
            ? {
                mpesaPaybill: settings.mpesaPaybill,
                mpesaTill: settings.mpesaTill,
                bankName: settings.bankName,
                bankAccountName: settings.bankAccountName,
                bankAccountNumber: settings.bankAccountNumber,
                bankBranch: settings.bankBranch,
              }
            : null
        }
      />
    </div>
  );
}
