import Link from "next/link";
import { ArrowRight, Home, Sprout, Building2, Droplets, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { getPagesByType } from "@/modules/content/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { SOLUTIONS_CONFIG } from "../_components/shop-by-solution";

export const metadata = {
  title: "Shop by Solar & Power Solution | Nuru Energy Kenya",
  description:
    "Tailored solar and power equipment packages for residential homes, agriculture & irrigation, commercial business backup, and solar borehole pumping in Kenya.",
  alternates: { canonical: "/solutions" },
};

const ICON_MAP: Record<string, typeof Home> = {
  "home-solar": Home,
  "farm-irrigation": Sprout,
  "business-backup": Building2,
  "borehole-systems": Droplets,
};

export default async function SolutionsIndexPage() {
  const pages = (await getPagesByType("SOLUTION")).filter((page) => page.isPublished);

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-10 px-4 py-10 sm:px-8">
      {/* Hero Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface-muted/40 p-6 sm:p-8">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Zap className="h-4 w-4" />
          Turnkey Solar & Power Packages
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Shop By Solar & Power Solution
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-500">
          We combine solar panels, hybrid inverters, lithium batteries, and pumping machinery into certified,
          engineered packages designed specifically for Kenyan homes, commercial businesses, and agricultural projects.
        </p>
      </div>

      {pages.length === 0 ? (
        <EmptyState title="No solutions published yet" description="Check back soon, or browse our full equipment catalogue." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((solution) => {
            const config = SOLUTIONS_CONFIG.find((c) => c.slug === solution.slug);
            const Icon = ICON_MAP[solution.slug] ?? Sparkles;
            const badge = config?.badge ?? "Solution";
            const tag = config?.tag ?? "Engineered Package";

            return (
              <Link
                key={solution.id}
                href={`/solutions/${solution.slug}`}
                className="group flex flex-col justify-between gap-6 rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-400 border border-brand-500/20">
                      {badge}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-bold text-foreground group-hover:text-brand-600 transition-colors">
                      {solution.title}
                    </h2>
                    {solution.seoDescription && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {solution.seoDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-[11px] font-medium text-neutral-400">{tag}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Trust & Consultation Footer */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground">Need a custom energy proposal or site visit?</h3>
            <p className="text-xs text-neutral-500">Our EPRA-certified engineers size and quote packages within 24 hours.</p>
          </div>
        </div>
        <Link
          href="/request-quotation"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-brand-700 transition-colors"
        >
          Request Custom Quotation
        </Link>
      </div>
    </div>
  );
}
