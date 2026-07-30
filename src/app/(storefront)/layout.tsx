import { StorefrontHeader } from "./_components/storefront-header";
import { StorefrontFooter } from "./_components/storefront-footer";

/**
 * Structural shell for public storefront pages.
 * Integrates modern header with categories/search/contact and enterprise footer.
 */
export default function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
