import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
} from "lucide-react";
import { getPageBySlug } from "@/modules/content/queries";
import { getSolutionProducts } from "@/modules/catalog/queries";
import { buildPageMetadata } from "@/modules/content/metadata";
import { PageContent } from "../../_components/page-content";
import { ProductCard } from "../../_components/product-card";
import { SOLUTIONS_CONFIG } from "../../_components/shop-by-solution";

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Readonly<SolutionPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (page?.type !== "SOLUTION") return {};
  return buildPageMetadata(page, `/solutions/${slug}`);
}

export default async function SolutionPage({ params }: Readonly<SolutionPageProps>) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (page?.type !== "SOLUTION") notFound();

  const config = SOLUTIONS_CONFIG.find((c) => c.slug === slug);
  const categorySlugs = config?.categorySlugs ?? [];
  const products = categorySlugs.length > 0 ? await getSolutionProducts(categorySlugs, 6) : [];

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-10 px-4 py-8 sm:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/solutions" className="hover:text-foreground transition-colors">Solutions</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground truncate">{page.title}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-surface-muted/40 p-6 sm:p-10 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-400 border border-brand-500/20">
            {config?.badge ?? "Turnkey Package"}
          </span>
          <span className="text-xs font-semibold text-neutral-400 font-mono">
            {config?.tag ?? "Engineered Solution"}
          </span>
        </div>

        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
            {page.title}
          </h1>
          {page.seoDescription && (
            <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {page.seoDescription}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/request-quotation"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-brand-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Request Custom Quotation</span>
          </Link>
          <a
            href="#equipment-packages"
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-5 py-2.5 text-xs font-bold text-foreground shadow-2xs hover:bg-surface-muted transition-colors"
          >
            <Package className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Browse Equipment</span>
          </a>
        </div>
      </div>

      {/* Featured Equipment Packages Grid */}
      {products.length > 0 && (
        <section id="equipment-packages" className="flex flex-col gap-6 scroll-mt-6">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <Zap className="h-3.5 w-3.5" />
                Featured Equipment
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Recommended Hardware & Bundles
              </h2>
            </div>
            <Link
              href={config?.categorySlugs?.[0] ? `/categories/${config.categorySlugs[0]}` : "/shop"}
              className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              <span>View Full Category</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Technical & Sizing Guide Body */}
      <section className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h2 className="text-lg font-bold text-foreground">Solution Guide & Technical Sizing</h2>
        </div>
        <div className="max-w-4xl">
          <PageContent title="" body={page.body} />
        </div>
      </section>

      {/* Custom Consultation & Quotation Banner */}
      <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-surface-muted/30 p-6 sm:p-8 md:flex-row md:items-center md:justify-between shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-foreground">
              Need an EPRA-Certified Solar Engineering Proposal?
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-neutral-500">
              Our engineering team analyzes your energy bills, daily peak sunshine hours, and load profile
              to deliver a certified equipment bill of quantities (BOQ) within 24 hours.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/request-quotation"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-2xs hover:bg-brand-700 transition-colors"
          >
            <span>Request Free Quotation</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
