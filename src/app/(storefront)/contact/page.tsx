import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageSquare, ChevronRight, FileText, Send } from "lucide-react";
import { getPageBySlug } from "@/modules/content/queries";
import { buildPageMetadata } from "@/modules/content/metadata";
import { getStoreSettings } from "@/modules/settings/queries";
import { PageContent } from "../_components/page-content";

const SLUG = "contact-us";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG);
  if (!page) return {};
  return buildPageMetadata(page, "/contact");
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug(SLUG), getStoreSettings()]);
  if (!page) notFound();

  const details = [
    settings.address && { icon: MapPin, label: "Store & Showroom Address", value: settings.address },
    settings.phone && { icon: Phone, label: "Customer Care & Orders", value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, "")}` },
    settings.email && { icon: Mail, label: "Official Support Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.businessHours && { icon: Clock, label: "Working Hours", value: settings.businessHours },
    settings.whatsapp && {
      icon: MessageSquare,
      label: "Instant WhatsApp Desk",
      value: "Chat directly with sales engineering",
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-10 px-4 py-8 sm:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground">Contact & Store Location</span>
      </nav>

      {/* Hero Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-surface-muted/40 p-6 sm:p-10 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Nairobi Central Store & Logistics
        </span>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
          Contact  Nuru Energy
        </h1>
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          Reach our certified engineering and sales team for hardware availability, custom solar system sizing, or visit our central Nairobi showroom.
        </p>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => {
            const Icon = detail.icon;
            const content = (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{detail.label}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-brand-600 transition-colors">
                  {detail.value}
                </span>
              </div>
            );

            return detail.href ? (
              <a
                key={detail.label}
                href={detail.href}
                target={detail.href.startsWith("http") ? "_blank" : undefined}
                rel={detail.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-3.5 rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs transition-all hover:border-brand-500/50 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                {content}
              </a>
            ) : (
              <div
                key={detail.label}
                className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content & Quotation Action */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-2xs">
          <PageContent title={page.title} body={page.body} />
        </article>

        {/* Side Fast Action Box */}
        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-surface p-6 shadow-2xs">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <FileText className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">Need a Formal Quotation?</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              If you have a bill of quantities or need a complete system proposal with installation, submit your equipment list directly.
            </p>
            <Link
              href="/request-quotation"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-brand-700 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Quotation Request</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
