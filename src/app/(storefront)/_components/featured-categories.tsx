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
} from "lucide-react";
import { getActiveCategories } from "@/modules/catalog/queries";

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

/** Live, featured top-level categories queried from real database entries. */
export async function FeaturedCategories() {
  const categories = await getActiveCategories();
  const featured = categories.filter((category) => category.isFeatured);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Equipment Catalogue
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Featured Equipment Categories
          </h2>
        </div>
        <Link
          href="/categories"
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
        >
          <span>View All Categories</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((category) => {
          const Icon = iconForCategory(category.slug);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col justify-between gap-6 rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300 border border-brand-500/20 font-mono">
                    {category.totalProductCount} item{category.totalProductCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.children.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                      {category.children.map((child) => child.name).join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                <span className="text-[11px] font-medium text-neutral-400">Explore equipment</span>
                <span className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400">
                  <span>View Products</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
