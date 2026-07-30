"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, NAV_SECTIONS, isNavItemActive } from "./nav-items";

export interface SidebarNavProps {
  visibleHrefs: string[];
  badges?: {
    pendingOrders?: number;
    newQuotations?: number;
    lowStock?: number;
  };
}

/**
 * Vertical nav list for the desktop sidebar, with icons, section groupings,
 * active-route highlighting, and real-time count badges.
 */
export function SidebarNav({ visibleHrefs, badges }: Readonly<SidebarNavProps>) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => visibleHrefs.includes(item.href));

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4 text-xs font-medium text-neutral-400">
      {NAV_SECTIONS.map((section) => {
        const sectionItems = visibleItems.filter((item) => item.section === section.key);
        if (sectionItems.length === 0) return null;

        return (
          <div key={section.key} className="flex flex-col gap-1">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400/90 dark:text-neutral-500">
              {section.label}
            </h3>
            <div className="mt-1 flex flex-col gap-0.5">
              {sectionItems.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                const Icon = item.icon;
                const badgeValue = item.badgeKey && badges ? badges[item.badgeKey] : undefined;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center justify-between rounded-control px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-brand-500/10 font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
                        : "text-neutral-600 hover:bg-surface-muted hover:text-foreground dark:text-neutral-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Active indicator border bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-400 dark:group-hover:text-neutral-200",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {badgeValue !== undefined && badgeValue > 0 && (
                      <span
                        className={cn(
                          "flex h-5 min-w-[20px] items-center justify-center rounded-pill px-1.5 text-[11px] font-semibold leading-none",
                          item.badgeKey === "lowStock"
                            ? "bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300"
                            : "bg-brand-100 text-brand-800 dark:bg-brand-500/30 dark:text-brand-200",
                        )}
                      >
                        {badgeValue}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
