"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, NAV_SECTIONS, isNavItemActive } from "./nav-items";

export interface MobileNavProps {
  visibleHrefs: string[];
  badges?: {
    pendingOrders?: number;
    newQuotations?: number;
    lowStock?: number;
  };
}

/** Primary routes fixed on the mobile bottom bar */
const PRIMARY_HREFS = ["/admin", "/admin/orders", "/admin/quotations", "/admin/products"];

/**
 * Bottom tab bar shown below `md` — 4 primary tabs + expandable "More" menu
 * that reveals all remaining admin navigation items in a bottom sheet.
 */
export function MobileNav({ visibleHrefs, badges }: Readonly<MobileNavProps>) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close sheet on route transition without triggering cascading effect renders
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMoreOpen(false);
  }

  // Close sheet on Escape key
  useEffect(() => {
    if (!isMoreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMoreOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen]);

  // Primary 4 tabs
  const primaryItems = NAV_ITEMS.filter(
    (item) => PRIMARY_HREFS.includes(item.href) && visibleHrefs.includes(item.href),
  ).sort((a, b) => PRIMARY_HREFS.indexOf(a.href) - PRIMARY_HREFS.indexOf(b.href));

  // Remaining items inside the "More" expandable sheet
  const moreItems = NAV_ITEMS.filter(
    (item) => !PRIMARY_HREFS.includes(item.href) && visibleHrefs.includes(item.href),
  );

  // Whether current active route lives inside the "More" menu
  const isMoreActive = moreItems.some((item) => isNavItemActive(pathname, item.href));

  // Total badges inside the "More" menu (e.g. lowStock)
  const moreBadgeCount = moreItems.reduce((acc, item) => {
    if (item.badgeKey && badges?.[item.badgeKey]) {
      return acc + (badges[item.badgeKey] ?? 0);
    }
    return acc;
  }, 0);

  return (
    <>
      {/* Backdrop for More Sheet */}
      {isMoreOpen && (
        <button
          type="button"
          aria-label="Close more menu"
          onClick={() => setIsMoreOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Expandable More Menu Bottom Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-x-0 bottom-14 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4 shadow-2xl transition-all duration-200 md:hidden">
          {/* Sheet Header */}
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">More Management</span>
              <span className="text-[11px] text-neutral-500">Access all catalog, system, and report tools</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-neutral-500 hover:text-foreground active:scale-95 transition-all"
              aria-label="Close more menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Grouped Menu Sections */}
          <div className="flex flex-col gap-4">
            {NAV_SECTIONS.map((section) => {
              const sectionItems = moreItems.filter((item) => item.section === section.key);
              if (sectionItems.length === 0) return null;

              return (
                <div key={section.key} className="flex flex-col gap-1.5">
                  <h4 className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {section.label}
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {sectionItems.map((item) => {
                      const isActive = isNavItemActive(pathname, item.href);
                      const Icon = item.icon;
                      const badgeValue = item.badgeKey && badges ? badges[item.badgeKey] : undefined;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all active:scale-98",
                            isActive
                              ? "border-brand-600/40 bg-brand-50/80 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30 shadow-2xs"
                              : "border-border/80 bg-surface-muted/40 text-neutral-700 hover:bg-surface-muted hover:text-foreground dark:text-neutral-200",
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                isActive
                                  ? "bg-brand-600 text-white dark:bg-brand-500"
                                  : "bg-surface text-neutral-500 border border-border/60 dark:text-neutral-400",
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {badgeValue !== undefined && badgeValue > 0 && (
                            <span
                              className={cn(
                                "flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold shrink-0",
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
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border/80 bg-surface/95 px-2 py-1.5 backdrop-blur-lg shadow-lg md:hidden">
        {/* 4 Primary Navigation Items */}
        {primaryItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href) && !isMoreOpen;
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

              {isActive && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: Expandable More Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={cn(
            "relative flex flex-1 flex-col items-center gap-0.5 rounded-control px-2 py-1 transition-all duration-150 active:scale-95",
            isMoreOpen || isMoreActive
              ? "font-semibold text-brand-600 dark:text-brand-400"
              : "text-neutral-500 hover:text-foreground dark:text-neutral-400",
          )}
          aria-expanded={isMoreOpen}
          aria-label="Toggle more navigation menu"
        >
          <div className="relative">
            {isMoreOpen ? (
              <X className="h-5 w-5 stroke-[2.25]" />
            ) : (
              <Menu className={cn("h-5 w-5", isMoreActive ? "stroke-[2.25]" : "stroke-[1.75]")} />
            )}

            {moreBadgeCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-warning-600 px-1 text-[10px] font-bold leading-none text-white shadow-xs">
                {moreBadgeCount > 99 ? "99+" : moreBadgeCount}
              </span>
            )}
          </div>

          <span className="text-[10px] font-medium leading-none">More</span>

          {(isMoreOpen || isMoreActive) && (
            <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
          )}
        </button>
      </nav>
    </>
  );
}
