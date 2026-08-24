import Link from "next/link";
import { Home, Sprout, Building2, Droplets, ArrowRight } from "lucide-react";

export const SOLUTIONS_CONFIG = [
  {
    slug: "home-solar",
    title: "Home Solar Power Systems",
    desc: "Complete solar panel, hybrid inverter & lithium battery bundles designed to run lights, TVs, refrigerators, and water pumps.",
    icon: Home,
    href: "/solutions/home-solar",
    badge: "Residential",
    tag: "Zero Electricity Bills",
    categorySlugs: ["solar-power-kits", "solar-inverters", "solar-batteries", "solar-panels"],
  },
  {
    slug: "farm-irrigation",
    title: "Farm & Irrigation Solar",
    desc: "Solar water pumping kits, borehole systems, and farm power for crop irrigation, livestock watering, and feed processing.",
    icon: Sprout,
    href: "/solutions/farm-irrigation",
    badge: "Agricultural",
    tag: "High Flow Pumping",
    categorySlugs: ["agriculture-machinery", "water-pumps", "petrol-water-pumps", "diesel-water-pumps"],
  },
  {
    slug: "business-backup",
    title: "Office & Business Backup",
    desc: "Seamless power backup packages to keep POS systems, servers, computers, security cameras, and shop lighting running 24/7.",
    icon: Building2,
    href: "/solutions/business-backup",
    badge: "Commercial",
    tag: "Instant Switchover",
    categorySlugs: ["generators", "silent-diesel-generators", "backup-power-kits", "solar-batteries"],
  },
  {
    slug: "borehole-systems",
    title: "Borehole Water Systems",
    desc: "Submersible borehole pumps with automatic solar MPPT drive controllers, stainless steel cables, and tank float switches.",
    icon: Droplets,
    href: "/solutions/borehole-systems",
    badge: "Water Pumping",
    tag: "Deep Well Sizing",
    categorySlugs: ["submersible-borehole-pumps", "water-pumps", "delivery-suction-pipes"],
  },
];

export function ShopBySolution() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Tailored Energy Packages
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Shop By Solar & Power Solution
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS_CONFIG.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between gap-5 rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs transition-all duration-200 hover:border-brand-500/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-400 border border-brand-500/20">
                    {item.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] font-semibold text-neutral-400">{item.tag}</span>
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>Explore Solution</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
