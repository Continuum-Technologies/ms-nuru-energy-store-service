import { StorefrontHeader } from "./_components/storefront-header";
import { StorefrontFooter } from "./_components/storefront-footer";
import { WhatsAppFloat } from "./_components/whatsapp-float";
import { getStoreSettings } from "@/modules/settings/queries";

/**
 * Structural shell for public storefront pages.
 * Integrates modern header with categories/search/contact, enterprise footer, and floating WhatsApp support.
 */
export default async function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <WhatsAppFloat whatsapp={settings.whatsapp} enabled={settings.whatsappOrderingEnabled} />
      <StorefrontFooter />
    </div>
  );
}
