import { ShieldCheck, Truck, Headphones, Wrench } from "lucide-react";

const VALUE_PROPOSITIONS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Equipment",
    desc: "All solar panels, batteries, inverters, and pumps are sourced directly from certified manufacturers with official warranties.",
  },
  {
    icon: Truck,
    title: "Countrywide Kenya Delivery",
    desc: "Fast dispatches from our Nairobi store to all 47 counties with reliable courier and transport partners.",
  },
  {
    icon: Headphones,
    title: "Free Technical Sizing",
    desc: "Talk directly with our energy engineers to calculate your exact load requirements before making any purchase.",
  },
  {
    icon: Wrench,
    title: "Installation & Support",
    desc: "Certified technical teams available for site assessments, system wiring, testing, and post-installation support.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-2xs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-success-200">
            Why Shop With Nuru Energy
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Kenya&apos;s Premier Energy Retailer
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPOSITIONS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div key={prop.title} className="flex flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-foreground">{prop.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {prop.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
