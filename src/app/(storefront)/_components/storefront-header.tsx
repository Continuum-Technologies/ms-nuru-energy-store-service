import Link from "next/link";
import { Zap, Phone, Search, ShoppingBag, FileText, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveCategories } from "@/modules/catalog/queries";
import { getCartItemCount } from "@/modules/cart/queries";
import { getStoreSettings } from "@/modules/settings/queries";
import { MobileDrawer } from "./mobile-drawer";

// Individual categories are browsed via /shop's filter sidebar and the
// homepage's FeaturedCategories grid, not flattened into this top strip —
// with a growing category list that overflowed into a horizontal scrollbar.
// This top-level strip stays a small, fixed set of destinations.
const NAV_LINKS = [
  { href: "/shop", label: "All Equipment" },
  { href: "/categories", label: "Categories" },
  { href: "/solutions", label: "Shop by Solution" },
  { href: "/request-quotation", label: "Request Quote" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

/** Category links are queried live (for the mobile drawer's category drilldown) so they never point at one that doesn't exist. */
export async function StorefrontHeader() {
  const [categories, cartItemCount, settings] = await Promise.all([
    getActiveCategories(),
    getCartItemCount(),
    getStoreSettings(),
  ]);
  const categoryLinks = categories.map((category) => ({ href: `/categories/${category.slug}`, label: category.name }));

  return (
    <StorefrontHeaderView
      categoryLinks={categoryLinks}
      cartItemCount={cartItemCount}
      phone={settings.phone}
      whatsapp={settings.whatsapp}
    />
  );
}

function StorefrontHeaderView({
  categoryLinks,
  cartItemCount,
  phone,
  whatsapp,
}: Readonly<{
  categoryLinks: { href: string; label: string }[];
  cartItemCount: number;
  phone: string | null;
  whatsapp: string | null;
}>) {
  return (
    <header className="sticky top-0 z-40 w-full flex-col border-b border-border/80 bg-surface/95 backdrop-blur-md">
      {/* Top Utility & Contact Bar */}
      <div className="border-b border-border/50 bg-neutral-900 text-xs text-white">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-4 py-1.5 sm:px-8">
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-neutral-300 sm:flex">
              <MapPin className="h-3.5 w-3.5 text-brand-400" />
              Nairobi Store • Countrywide Kenya Delivery
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <ShieldCheck className="h-3.5 w-3.5 text-success-200" />
              Genuine Warranty Guaranteed
            </span>
          </div>

          <div className="flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-1 font-semibold text-brand-300 transition-colors hover:text-white"
              >
                <Phone className="h-3 w-3" />
                <span>{phone}</span>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full bg-success-600 px-2.5 py-0.5 font-bold text-white transition-colors hover:bg-success-700 sm:inline-flex"
              >
                WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Search Bar */}
      <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-foreground sm:text-xl">
              Nuru Energy
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Solar • Power • Machinery
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md mx-6 md:flex">
          <form action="/search" className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Search solar panels, inverters, batteries, generators..."
              className="w-full rounded-pill border border-border/80 bg-surface-muted/60 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-neutral-400 focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/request-quotation" className="hidden sm:block">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <FileText className="h-4 w-4 text-brand-600" />
              Request Quote
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button size="sm" className="gap-1.5 font-semibold">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
            </Button>
            {cartItemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          <MobileDrawer categoryLinks={categoryLinks} />
        </div>
      </div>

      {/* Primary Navigation Strip */}
      <nav className="hidden border-t border-border/60 bg-surface-muted/40 md:block">
        <div className="mx-auto flex max-w-[1536px] items-center gap-6 px-4 py-2.5 text-xs font-semibold sm:px-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
