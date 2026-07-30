import Link from "next/link";
import { Sun, BatteryCharging, Zap, Wrench, Droplets, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";
import { getActiveCategories } from "@/modules/catalog/queries";

// Category has no icon field of its own — this maps a slug keyword to one of
// a small fixed icon set, the same "real data + sensible presentation"
// pattern BrandPartners already established, rather than storing/fabricating
// per-category icon data.
const ICON_RULES: [pattern: RegExp, icon: LucideIcon][] = [
  [/solar|panel/i, Sun],
  [/batter/i, BatteryCharging],
  [/invert/i, Zap],
  [/generat|engine|machin/i, Wrench],
  [/pump|water/i, Droplets],
];

function iconForCategory(slug: string): LucideIcon {
  return ICON_RULES.find(([pattern]) => pattern.test(slug))?.[1] ?? ShieldCheck;
}

/** Live, featured top-level categories — queried, never a hardcoded marketing list (CLAUDE.md §11's "no fabricated data"). */
export async function FeaturedCategories() {
  const categories = await getActiveCategories();
  const featured = categories.filter((category) => category.isFeatured);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Equipment Catalog
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Featured Equipment Categories
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((category) => {
          const Icon = iconForCategory(category.slug);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col justify-between gap-6 rounded-2xl border border-border/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-200">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.children.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {category.children.map((child) => child.name).join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>View Products</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
