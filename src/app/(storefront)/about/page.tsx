import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Zap, Award, Truck } from "lucide-react";
import { getPageBySlug } from "@/modules/content/queries";
import { buildPageMetadata } from "@/modules/content/metadata";
import { PageContent } from "../_components/page-content";

const SLUG = "about-us";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG);
  if (!page) return {};
  return buildPageMetadata(page, "/about");
}

export default async function AboutPage() {
  const page = await getPageBySlug(SLUG);
  if (!page) notFound();

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-10 px-4 py-8 sm:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground">About Us</span>
      </nav>

      {/* Hero Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-surface-muted/40 p-6 sm:p-10 shadow-2xs">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Zap className="h-4 w-4" />
          Authentic Kenyan Energy Retailer
        </span>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
          About Nuru Energy
        </h1>
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          Bridging the gap between certified global energy hardware and Kenyan households, commercial businesses, and agricultural projects.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-2xs">
            <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">100% Genuine Hardware</span>
              <span className="text-[11px] text-neutral-400">Direct factory warranty</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-2xs">
            <Award className="h-6 w-6 text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">EPRA-Compliant</span>
              <span className="text-[11px] text-neutral-400">Certified solar sizing</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-2xs">
            <Truck className="h-6 w-6 text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">All 47 Counties</span>
              <span className="text-[11px] text-neutral-400">Nationwide courier transit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <article className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-2xs max-w-4xl mx-auto w-full">
        <PageContent title={page.title} body={page.body} />
      </article>
    </div>
  );
}
