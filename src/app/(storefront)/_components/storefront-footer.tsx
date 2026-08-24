import Link from "next/link";
import { Zap, Phone, Mail, MapPin, MessageSquare, FileText, ShieldCheck, HelpCircle, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoreSettings } from "@/modules/settings/queries";

export async function StorefrontFooter() {
  const settings = await getStoreSettings();

  return (
    <footer className="border-t border-border/80 bg-neutral-950 text-neutral-300 font-sans">
      {/* Consultation Banner */}
      <div className="border-b border-neutral-800 bg-gradient-to-r from-brand-600/20 via-brand-700/10 to-transparent py-10">
        <div className="mx-auto flex max-w-[1536px] flex-col items-start justify-between gap-6 px-4 sm:px-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Free Technical Consultation
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Need Custom Solar, Power Backup or Water Pumping Equipment?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed sm:text-sm">
              Talk directly with our technical engineering team for tailored equipment sizing, site assessments, and countrywide delivery across Kenya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/request-quotation">
              <Button className="gap-2 font-bold shadow-md bg-brand-500 text-neutral-950 hover:bg-brand-400">
                <FileText className="h-4 w-4" />
                Request Custom Quote
              </Button>
            </Link>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-control bg-success-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-success-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Consultation
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-[1536px] px-4 py-12 sm:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Company Branding & Contact */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-neutral-950">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">{settings.businessName}</span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Kenya’s trusted single-store provider for premium solar panels, lithium/gel batteries, hybrid inverters, silent diesel generators, solar borehole pumps, and farm machinery.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-neutral-400">
              {settings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-400" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Equipment Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Equipment Categories
            </span>
            <ul className="flex flex-col gap-2 text-xs text-neutral-400">
              <li>
                <Link href="/categories/solar-panels" className="transition-colors hover:text-brand-400">
                  Solar Panels
                </Link>
              </li>
              <li>
                <Link href="/categories/solar-inverters" className="transition-colors hover:text-brand-400">
                  Hybrid Solar Inverters
                </Link>
              </li>
              <li>
                <Link href="/categories/solar-batteries" className="transition-colors hover:text-brand-400">
                  Lithium & Gel Solar Batteries
                </Link>
              </li>
              <li>
                <Link href="/categories/solar-power-kits" className="transition-colors hover:text-brand-400">
                  Solar Power Kits & Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/water-pumps" className="transition-colors hover:text-brand-400">
                  Solar & Borehole Water Pumps
                </Link>
              </li>
              <li>
                <Link href="/categories/generators" className="transition-colors hover:text-brand-400">
                  Generators & Silent Diesel Engines
                </Link>
              </li>
              <li>
                <Link href="/categories/agriculture-machinery" className="transition-colors hover:text-brand-400">
                  Agriculture & Farming Machinery
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Services */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Solutions & Services
            </span>
            <ul className="flex flex-col gap-2 text-xs text-neutral-400">
              <li>
                <Link href="/solutions/home-solar" className="transition-colors hover:text-brand-400">
                  Home Solar Power Systems
                </Link>
              </li>
              <li>
                <Link href="/solutions/farm-irrigation" className="transition-colors hover:text-brand-400">
                  Farm & Irrigation Solar
                </Link>
              </li>
              <li>
                <Link href="/solutions/business-backup" className="transition-colors hover:text-brand-400">
                  Office & Business Power Backup
                </Link>
              </li>
              <li>
                <Link href="/solutions/borehole-systems" className="transition-colors hover:text-brand-400">
                  Borehole Water Pumping Systems
                </Link>
              </li>
              <li>
                <Link href="/request-quotation" className="transition-colors hover:text-brand-400">
                  Custom Engineering Sizing (BOQ)
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="transition-colors font-medium text-brand-400 hover:text-brand-300">
                  View All Solutions &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Care & Policy
            </span>
            <ul className="flex flex-col gap-2 text-xs text-neutral-400">
              <li>
                <Link href="/pages/delivery-shipping" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-400">
                  <Truck className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Delivery & Shipping Info</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/warranty-returns" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-400">
                  <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Warranty & Returns Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/faq" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-400">
                  <HelpCircle className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-brand-400">
                  Contact & Store Location
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-brand-400">
                  About Nuru Energy
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="transition-colors hover:text-brand-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/terms-conditions" className="transition-colors hover:text-brand-400">
                  Terms & Conditions of Sale
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Genuine Warranty Guarantee Badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-success-200" />
            <span>100% Genuine Equipment with EPRA-Compliant Manufacturer Warranties</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-400">
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-success-200">
              M-PESA Paybill / Till
            </span>
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-info-200">
              Direct Bank Transfer (EFT/RTGS)
            </span>
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-brand-400">
              Store Pickup & Card
            </span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs text-neutral-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <p>Engineered for Kenyan Homes, Farms, and Enterprises.</p>
        </div>
      </div>
    </footer>
  );
}
