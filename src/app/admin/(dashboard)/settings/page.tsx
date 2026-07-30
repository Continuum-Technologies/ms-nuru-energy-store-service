import { UnderDevelopment } from "@/components/ui/under-development";

export default function SettingsPage() {
  return (
    <UnderDevelopment
      title="Store Settings"
      description="Configure payment credentials, tax rates, store information, and notification settings."
      moduleName="Settings"
      expectedFeatures={[
        "M-Pesa & Bank Transfer Payment Gateway Configuration",
        "Store Contact & Location Information",
        "VAT & Tax Calculation Preferences",
        "Order & Quotation Email Notification Settings",
      ]}
    />
  );
}
