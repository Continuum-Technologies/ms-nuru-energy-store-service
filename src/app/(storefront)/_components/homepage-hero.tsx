import Link from "next/link";
import { Sun, BatteryCharging, Zap, Wrench, ShieldCheck, ArrowRight, ChevronRight, FileText, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const SIDEBAR_CATEGORIES = [
  { label: "Solar & Renewable Energy", href: "/shop?category=solar-panels", icon: Sun },
  { label: "Solar Batteries (Lithium/Gel)", href: "/shop?category=solar-batteries", icon: BatteryCharging },
  { label: "Inverters & Off-Grid Kits", href: "/shop?category=inverters", icon: Zap },
  { label: "Petrol & Diesel Generators", href: "/shop?category=generators", icon: Wrench },
  { label: "Borehole & Water Pumps", href: "/shop?category=water-pumps", icon: Wrench },
  { label: "Agriculture & Farm Tools", href: "/shop?category=farm-tools", icon: Sparkles },
  { label: "Electricals & Wiring Cables", href: "/shop?category=accessories", icon: ShieldCheck },
];

export function HomepageHero() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Sidebar Category Navigation (Desktop) */}
      <div className="hidden lg:col-span-3 lg:block">
        <div className="flex flex-col rounded-2xl border border-border/80 bg-surface shadow-2xs overflow-hidden">
          <div className="bg-neutral-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-400">
            Shop Equipment by Category
          </div>
          <div className="flex flex-col divide-y divide-border/50 text-xs">
            {SIDEBAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group flex items-center justify-between p-3 font-medium text-foreground transition-colors hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-brand-500" />
                    <span>{cat.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Center Hero Banner */}
      <div className="lg:col-span-6 flex flex-col">
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-brand-950/40 p-8 text-white shadow-md">
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Lithium Solar Systems & Backup Power</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-4xl text-white leading-tight">
              Reliable Power Storage for Homes & Businesses Across Kenya
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
              High-performance mono solar panels, hybrid inverters, lithium batteries & backup generators — backed by expert sizing, site assessment, and fast delivery to all 47 counties.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/shop" className={buttonVariants({ size: "sm", className: "font-bold gap-2 bg-brand-500 text-neutral-950 hover:bg-brand-400" })}>
                Browse Equipment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/request-quotation" className={buttonVariants({ variant: "outline", size: "sm", className: "font-bold gap-2 text-white border-neutral-700 hover:bg-neutral-800" })}>
                <FileText className="h-4 w-4 text-brand-400" />
                Request Custom Quotation
              </Link>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        </div>
      </div>

      {/* Right Side Promo Callout Cards */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Generator Promo */}
        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border/80 bg-gradient-to-br from-surface to-surface-muted p-5 shadow-2xs">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Backup Power Generators
            </span>
            <h3 className="text-base font-bold text-foreground">
              Petrol & Silent Diesel Generators
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Commercial & household generator sets with electric start.
            </p>
          </div>
          <Link
            href="/shop?category=generators"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 pt-3 hover:underline"
          >
            <span>Explore Generators</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Solar Water Pump Promo */}
        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border/80 bg-gradient-to-br from-surface to-surface-muted p-5 shadow-2xs">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-success-700 dark:text-success-200">
              Farm & Agriculture Solutions
            </span>
            <h3 className="text-base font-bold text-foreground">
              Solar Water Pumping Systems
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Complete borehole & surface irrigation pump packages.
            </p>
          </div>
          <Link
            href="/shop?category=water-pumps"
            className="inline-flex items-center gap-1 text-xs font-bold text-success-700 dark:text-success-200 pt-3 hover:underline"
          >
            <span>View Solar Pump Kits</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
