import Link from "next/link";
import { Zap, Phone, Mail, MapPin, MessageSquare, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StorefrontFooter() {
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
              Talk directly with our technical team for tailored equipment sizing, site assessments, and countrywide delivery across Kenya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/request-quotation">
              <Button className="gap-2 font-bold shadow-md bg-brand-500 text-neutral-950 hover:bg-brand-400">
                <FileText className="h-4 w-4" />
                Request Custom Quote
              </Button>
            </Link>
            <a
              href="https://wa.me/254719375096"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-control bg-success-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-success-700"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Consultation
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid */}
      <div className="mx-auto max-w-[1536px] px-4 py-12 sm:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Company Branding */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-neutral-950">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">Nuru Energy Store</span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Kenya’s trusted single-store provider for premium solar panels, lithium/gel batteries, hybrid inverters, diesel/petrol generators, water pumps, power equipment, and machinery.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-400" />
                <span>Nairobi Store • Countrywide Delivery across Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                <span>+254 719 375 096</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                <span>info@nuruenergy.co.ke</span>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Equipment Categories
            </span>
            <ul className="flex flex-col gap-2 text-xs text-neutral-400">
              <li>
                <Link href="/shop?category=solar-panels" className="transition-colors hover:text-brand-400">
                  Solar Panels
                </Link>
              </li>
              <li>
                <Link href="/shop?category=solar-batteries" className="transition-colors hover:text-brand-400">
                  Solar Batteries
                </Link>
              </li>
              <li>
                <Link href="/shop?category=inverters" className="transition-colors hover:text-brand-400">
                  Hybrid & Off-Grid Inverters
                </Link>
              </li>
              <li>
                <Link href="/shop?category=generators" className="transition-colors hover:text-brand-400">
                  Generators & Engines
                </Link>
              </li>
              <li>
                <Link href="/shop?category=water-pumps" className="transition-colors hover:text-brand-400">
                  Solar & Submersible Water Pumps
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="transition-colors hover:text-brand-400">
                  Accessories & Cables
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
                <Link href="/solutions/farm-solar" className="transition-colors hover:text-brand-400">
                  Farm & Irrigation Pumping
                </Link>
              </li>
              <li>
                <Link href="/solutions/backup-power" className="transition-colors hover:text-brand-400">
                  Office & Business Backup
                </Link>
              </li>
              <li>
                <Link href="/solutions/water-pumping" className="transition-colors hover:text-brand-400">
                  Borehole Pumping Systems
                </Link>
              </li>
              <li>
                <Link href="/request-quotation" className="transition-colors hover:text-brand-400">
                  Professional Site Assessment
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
                <Link href="/request-quotation" className="transition-colors hover:text-brand-400">
                  Request a Quotation
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
            </ul>
          </div>
        </div>

        {/* Payment & Guarantee Badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-success-200" />
            <span>100% Genuine Equipment with Manufacturer Warranties</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-400">
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-success-200">
              M-PESA Paybill / Till
            </span>
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-info-200">
              Direct Bank Transfer
            </span>
            <span className="rounded bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-brand-400">
              Cash on Store Collection
            </span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs text-neutral-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Nuru Energy Store. All rights reserved.</p>
          <p>Engineered for Kenyan Homes, Farms, and Enterprises.</p>
        </div>
      </div>
    </footer>
  );
}
