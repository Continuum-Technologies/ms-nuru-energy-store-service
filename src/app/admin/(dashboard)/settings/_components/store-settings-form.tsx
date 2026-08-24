"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Building2,
  Coins,
  Truck,
  Bell,
  Landmark,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateStoreSettings } from "@/modules/settings/actions";
import { BusinessInfoSection } from "./business-info-section";
import { CommerceTaxSection } from "./commerce-tax-section";
import { DeliveryPoliciesSection } from "./delivery-policies-section";
import { NotificationsSeoSection } from "./notifications-seo-section";
import { PaymentDetailsSection, type PaymentDetailsSettings } from "./payment-details-section";

export interface StoreSettingsFormValues {
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  county: string | null;
  businessHours: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  currency: string;
  vatRate: string;
  pricesIncludeVat: boolean;
  deliveryInfo: string | null;
  collectionInfo: string | null;
  warrantyPolicySummary: string | null;
  returnPolicySummary: string | null;
  quotationTermsDefault: string | null;
  orderNotificationEmails: string | null;
  lowStockThresholdDefault: number;
  seoTitleSuffix: string | null;
  seoDefaultDescription: string | null;
}

export interface StoreSettingsFormProps {
  settings: StoreSettingsFormValues;
  canManagePayments?: boolean;
  paymentSettings?: PaymentDetailsSettings | null;
  initialTab?: string;
}

const TABS = [
  {
    id: "business-identity",
    label: "Store Profile",
    description: "Branding, logo, contacts & hours",
    icon: Building2,
    badge: null,
  },
  {
    id: "currency-tax",
    label: "Currency & Tax",
    description: "Billing currency & Kenya VAT",
    icon: Coins,
    badge: null,
  },
  {
    id: "delivery-policies",
    label: "Delivery & Policies",
    description: "Shipping notes, terms & policies",
    icon: Truck,
    badge: null,
  },
  {
    id: "notifications-seo",
    label: "Notifications & SEO",
    description: "Alert recipients & search metadata",
    icon: Bell,
    badge: null,
  },
] as const;

export function StoreSettingsForm({
  settings,
  canManagePayments = false,
  paymentSettings = null,
  initialTab = "business-identity",
}: Readonly<StoreSettingsFormProps>) {
  const [state, formAction, pending] = useActionState(updateStoreSettings, undefined);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState<string>(initialTab);
  const [, startTransition] = useTransition();

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    startTransition(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabId);
        window.history.replaceState({}, "", url.toString());
      }
    });
  }

  const allTabs = [
    ...TABS,
    ...(canManagePayments && paymentSettings
      ? [
          {
            id: "payment-credentials",
            label: "Payment Credentials",
            description: "M-Pesa & Bank account checkout",
            icon: Landmark,
            badge: "Owner",
          },
        ]
      : []),
  ];

  const isGeneralTab = activeTab !== "payment-credentials";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left Sidebar / Mobile Swipeable Category Navigation */}
      <nav
        aria-label="Settings Categories"
        role="tablist"
        className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible w-full lg:w-72 shrink-0 rounded-2xl border border-border/80 bg-surface/90 p-1.5 sm:p-2 shadow-2xs backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="hidden lg:block px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Configuration Categories
        </div>
        {allTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`group flex items-center lg:items-start gap-2.5 sm:gap-3 rounded-xl px-3 py-2 lg:p-2.5 text-left transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink min-h-[42px] ${
                isActive
                  ? "bg-brand-50/90 text-brand-900 border border-brand-200/90 shadow-2xs dark:bg-brand-950/60 dark:text-brand-200 dark:border-brand-800"
                  : "text-neutral-600 hover:bg-neutral-100/80 hover:text-foreground dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200 border border-transparent"
              }`}
            >
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-600 text-brand-50 shadow-2xs dark:bg-brand-500"
                    : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/80 group-hover:text-foreground dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-xs sm:text-sm font-semibold truncate ${isActive ? "text-brand-950 dark:text-brand-100" : "text-foreground"}`}>
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-brand-200 text-brand-900 dark:bg-brand-900 dark:text-brand-200"
                          : "bg-neutral-200/80 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                  {tab.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Right Content Panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* General Store Settings Form (wraps the 4 general settings sections) */}
        <form action={formAction} className={isGeneralTab ? "flex flex-col gap-6" : "hidden"}>
          {/* Global Feedback Banners for Store Settings */}
          {state?.success && (
            <output className="flex items-center gap-2.5 rounded-control border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-950/40 dark:text-success-300 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400 shrink-0" />
              <span>Store settings saved successfully and cached storefront assets revalidated.</span>
            </output>
          )}

          {state?.error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-300 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Tab 1: Business Profile & Branding */}
          <div
            id="panel-business-identity"
            role="tabpanel"
            aria-labelledby="tab-business-identity"
            className={activeTab === "business-identity" ? "block" : "hidden"}
          >
            <BusinessInfoSection settings={settings} pending={pending} />
          </div>

          {/* Tab 2: Currency & Tax */}
          <div
            id="panel-currency-tax"
            role="tabpanel"
            aria-labelledby="tab-currency-tax"
            className={activeTab === "currency-tax" ? "block" : "hidden"}
          >
            <CommerceTaxSection settings={settings} pending={pending} />
          </div>

          {/* Tab 3: Delivery & Policies */}
          <div
            id="panel-delivery-policies"
            role="tabpanel"
            aria-labelledby="tab-delivery-policies"
            className={activeTab === "delivery-policies" ? "block" : "hidden"}
          >
            <DeliveryPoliciesSection settings={settings} pending={pending} />
          </div>

          {/* Tab 4: Notifications & SEO */}
          <div
            id="panel-notifications-seo"
            role="tabpanel"
            aria-labelledby="tab-notifications-seo"
            className={activeTab === "notifications-seo" ? "block" : "hidden"}
          >
            <NotificationsSeoSection settings={settings} pending={pending} />
          </div>
        </form>

        {/* Tab 5: Payment Credentials & Checkout Instructions (Owner Only) */}
        {canManagePayments && paymentSettings && (
          <div
            id="panel-payment-credentials"
            role="tabpanel"
            aria-labelledby="tab-payment-credentials"
            className={activeTab === "payment-credentials" ? "block" : "hidden"}
          >
            <PaymentDetailsSection settings={paymentSettings} />
          </div>
        )}
      </div>
    </div>
  );
}
