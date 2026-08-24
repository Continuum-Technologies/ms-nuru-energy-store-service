import type { Metadata } from "next";
import Link from "next/link";
import {
  Sun,
  BatteryCharging,
  Zap,
  Wrench,
  Droplets,
  Sprout,
  Egg,
  Flame,
  Hammer,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
  ChevronRight,
} from "lucide-react";
import { getActiveCategories } from "@/modules/catalog/queries";

export const metadata: Metadata = {
  title: "Equipment Categories | Nuru Energy Kenya",
  description:
    "Browse our complete catalog of solar panels, hybrid inverters, lithium batteries, solar borehole pumps, generators, and agricultural machinery.",
  alternates: { canonical: "/categories" },
};

const ICON_RULES: [pattern: RegExp, icon: LucideIcon][] = [
  [/solar.*panel|panel/i, Sun],
  [/batter/i, BatteryCharging],
  [/invert/i, Zap],
  [/generat|engine/i, Wrench],
  [/pump|water|borehole/i, Droplets],
  [/farm|agri|tractor|chaff|milking|seed|brush/i, Sprout],
  [/incubator|egg/i, Egg],
  [/biogas/i, Flame],
  [/construct|tool|weld/i, Hammer],
  [/clean|wash/i, Sparkles],
];

function iconForCategory(slug: string): LucideIcon {
  return ICON_RULES.find(([pattern]) => pattern.test(slug))?.[1] ?? ShieldCheck;
}

export default async function CategoriesIndexPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-10 px-4 py-8 sm:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground">Equipment Categories</span>
      </nav>

      {/* Hero Banner */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-surface-muted/40 p-6 sm:p-10 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Equipment Catalogue
        </span>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
          Browse Equipment by Category
        </h1>
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          Explore authentic, factory-warranted solar, power backup, and agricultural machinery available with countrywide delivery across Kenya.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = iconForCategory(category.slug);
          return (
            <div
              key={category.id}
              className="group flex flex-col justify-between gap-6 rounded-3xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:text-brand-300 border border-brand-500/20 font-mono">
                    {category.totalProductCount} item{category.totalProductCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/categories/${category.slug}`}>
                    <h2 className="text-lg font-bold text-foreground group-hover:text-brand-600 transition-colors">
                      {category.name}
                    </h2>
                  </Link>

                  {/* Subcategories list */}
                  {category.children.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          className="inline-flex items-center gap-1 rounded-pill border border-border/70 bg-surface-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 hover:border-brand-500/50 hover:text-brand-600 dark:text-neutral-300 transition-colors"
                        >
                          <span>{child.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">({child.productCount})</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  <span>Explore {category.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
