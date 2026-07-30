import Link from "next/link";
import { Sun, BatteryCharging, Zap, Wrench, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

const FEATURED_CATEGORIES = [
  {
    title: "Solar Panels",
    desc: "High-efficiency monocrystalline & bifacial solar panels for home & commercial installations.",
    icon: Sun,
    href: "/shop?category=solar-panels",
    badge: "Top Seller",
    color: "from-brand-500/10 to-brand-700/5 text-brand-700 dark:text-brand-200",
  },
  {
    title: "Solar Batteries",
    desc: "Lithium LiFePO4 & Gel deep cycle energy storage for seamless backup power.",
    icon: BatteryCharging,
    href: "/shop?category=solar-batteries",
    badge: "5yr Warranty",
    color: "from-success-600/10 to-success-700/5 text-success-700 dark:text-success-200",
  },
  {
    title: "Inverters & Off-Grid",
    desc: "Pure sine wave hybrid & off-grid inverters with built-in MPPT charge controllers.",
    icon: Zap,
    href: "/shop?category=inverters",
    badge: "Hybrid / Off-Grid",
    color: "from-info-600/10 to-info-700/5 text-info-700 dark:text-info-200",
  },
  {
    title: "Generators & Engines",
    desc: "Petrol & silent diesel generators with electric key start for home & job sites.",
    icon: Wrench,
    href: "/shop?category=generators",
    badge: "Heavy Duty",
    color: "from-warning-600/10 to-warning-700/5 text-warning-700 dark:text-warning-200",
  },
  {
    title: "Water & Borehole Pumps",
    desc: "Solar-powered submersible & surface water pumps for farming & domestic use.",
    icon: Sparkles,
    href: "/shop?category=water-pumps",
    badge: "Agriculture",
    color: "from-danger-600/10 to-danger-700/5 text-danger-700 dark:text-danger-200",
  },
  {
    title: "Accessories & Cables",
    desc: "Solar PV cables, DC breakers, mounting brackets, connectors & surge protectors.",
    icon: ShieldCheck,
    href: "/shop?category=accessories",
    badge: "Installation",
    color: "from-neutral-500/10 to-neutral-600/5 text-neutral-700 dark:text-neutral-300",
  },
];

export function FeaturedCategories() {
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
        {FEATURED_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col justify-between gap-6 rounded-2xl border border-border/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] font-bold text-neutral-500 border border-border/60">
                    {cat.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {cat.desc}
                  </p>
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
