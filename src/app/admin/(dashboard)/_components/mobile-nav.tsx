"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

/**
 * Bottom tab bar shown below `md` — the first five visible nav items,
 * reachable without a hamburger menu (PRD §19.2: the owner runs most of the
 * store from a phone). See {@link SidebarNav} for why this takes hrefs
 * rather than full nav item objects.
 */
export interface MobileNavProps {
  visibleHrefs: string[];
  badges?: {
    pendingOrders?: number;
    newQuotations?: number;
    lowStock?: number;
  };
}

/**
 * Bottom tab bar shown below `md` — priority nav items, reachable without a hamburger menu
 * (PRD §19.2: the owner runs most of the store from a phone).
 */
export function MobileNav({ visibleHrefs, badges }: Readonly<MobileNavProps>) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => visibleHrefs.includes(item.href));

  // Prioritize primary operational routes for mobile tab bar
  const priorityOrder = ["/admin", "/admin/orders", "/admin/quotations", "/admin/products", "/admin/inventory"];
  const sortedItems = [...items].sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.href);
    const idxB = priorityOrder.indexOf(b.href);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/80 bg-surface/90 px-2 py-1.5 backdrop-blur-lg shadow-lg md:hidden">
      {sortedItems.slice(0, 5).map((item) => {
        const isActive = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        const badgeValue = item.badgeKey && badges ? badges[item.badgeKey] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 rounded-control px-2 py-1 transition-all duration-150 active:scale-95",
              isActive
                ? "font-semibold text-brand-600 dark:text-brand-400"
                : "text-neutral-500 hover:text-foreground dark:text-neutral-400",
            )}
          >
            <div className="relative">
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
              {badgeValue !== undefined && badgeValue > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white shadow-xs">
                  {badgeValue > 99 ? "99+" : badgeValue}
                </span>
              )}
            </div>

            <span className="text-[10px] font-medium leading-none">{item.label}</span>

            {/* Active Dot Indicator */}
            {isActive && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
