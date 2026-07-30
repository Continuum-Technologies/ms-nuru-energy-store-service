import { ShoppingCart, DollarSign, FileClock, FileText, AlertTriangle, PackageX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/currency";

export interface KpiStats {
  ordersToday: number;
  salesToday: number;
  pendingOrders: number;
  newQuotations: number;
  lowStock: number;
  outOfStock: number;
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  tone: "brand" | "success" | "warning" | "danger" | "info";
}

/**
 * Tone → Tailwind classes, built entirely from this project's theme tokens
 * (`brand`/`success`/`warning`/`danger`/`info` from `styles/theme.css`) so a
 * palette change only ever needs to happen in one place.
 */
const TONE_STYLES: Record<KpiCardProps["tone"], { bg: string; iconBg: string; badge: string }> = {
  brand: {
    bg: "from-brand-500/10 to-brand-700/5 border-brand-500/20 dark:from-brand-500/20 dark:to-brand-700/10",
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xs",
    badge: "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300",
  },
  success: {
    bg: "from-success-600/10 to-success-700/5 border-success-600/20 dark:from-success-600/20 dark:to-success-700/10",
    iconBg: "bg-gradient-to-br from-success-600 to-success-700 text-white shadow-xs",
    badge: "bg-success-50 text-success-700 dark:bg-success-600/20 dark:text-success-200",
  },
  warning: {
    bg: "from-warning-600/10 to-warning-700/5 border-warning-600/20 dark:from-warning-600/20 dark:to-warning-700/10",
    iconBg: "bg-gradient-to-br from-warning-600 to-warning-700 text-white shadow-xs",
    badge: "bg-warning-50 text-warning-700 dark:bg-warning-600/20 dark:text-warning-200",
  },
  danger: {
    bg: "from-danger-600/10 to-danger-700/5 border-danger-600/20 dark:from-danger-600/20 dark:to-danger-700/10",
    iconBg: "bg-gradient-to-br from-danger-600 to-danger-700 text-white shadow-xs",
    badge: "bg-danger-50 text-danger-700 dark:bg-danger-600/20 dark:text-danger-200",
  },
  info: {
    bg: "from-info-600/10 to-info-700/5 border-info-600/20 dark:from-info-600/20 dark:to-info-700/10",
    iconBg: "bg-gradient-to-br from-info-600 to-info-700 text-white shadow-xs",
    badge: "bg-info-50 text-info-700 dark:bg-info-600/20 dark:text-info-200",
  },
};

/**
 * A single KPI tile — title, value, tone-tinted icon, and a status subtitle.
 * Reusable directly (e.g. a Products list's Total/Draft/Active/Out-of-stock
 * row) — compose your own grid from this rather than building a second
 * stat-tile component. {@link KpiCardsGrid} below is the dashboard's specific
 * 6-stat arrangement built from it.
 */
export function KpiCard({ title, value, subtitle, icon, tone }: Readonly<KpiCardProps>) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-card border bg-gradient-to-br p-3.5 sm:p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        styles.bg,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-neutral-500 sm:text-xs dark:text-neutral-400">
            {title}
          </span>
          <span className="mt-1 truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {value}
          </span>
        </div>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl",
            styles.iconBg,
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 border-t border-border/40 pt-2 sm:mt-4 sm:pt-3">
        <span
          className={cn(
            "truncate rounded-pill px-2 py-0.5 text-[9px] font-semibold tracking-wide sm:text-[10px]",
            styles.badge,
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}

/**
 * The six headline operations figures for the admin dashboard (and, later,
 * Reports). Values come from live queries — see
 * `src/app/admin/(dashboard)/_lib/operational-stats.ts` — never fabricated.
 */
export function KpiCardsGrid({ stats }: Readonly<{ stats: KpiStats }>) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Orders Today"
        value={stats.ordersToday}
        subtitle="Live Feed"
        icon={<ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="brand"
      />
      <KpiCard
        title="Sales Today"
        value={formatKes(stats.salesToday)}
        subtitle="Gross Total"
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="success"
      />
      <KpiCard
        title="Pending Orders"
        value={stats.pendingOrders}
        subtitle={stats.pendingOrders > 0 ? "Requires Review" : "Queue Clean"}
        icon={<FileClock className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="warning"
      />
      <KpiCard
        title="New Quotations"
        value={stats.newQuotations}
        subtitle={stats.newQuotations > 0 ? "Awaiting Quote" : "Up to Date"}
        icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="info"
      />
      <KpiCard
        title="Low Stock"
        value={stats.lowStock}
        subtitle={stats.lowStock > 0 ? "Action Needed" : "Stock Healthy"}
        icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="warning"
      />
      <KpiCard
        title="Out of Stock"
        value={stats.outOfStock}
        subtitle={stats.outOfStock > 0 ? "Replenish Now" : "All Available"}
        icon={<PackageX className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="danger"
      />
    </div>
  );
}
