"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  RotateCcw,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { ActiveCategory, ActiveBrand, ProductSort } from "@/modules/catalog/queries";

export interface ProductFiltersProps {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  categories: ActiveCategory[];
  brands: ActiveBrand[];
  activeCategorySlug?: string;
  activeBrandSlug?: string;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const BUDGET_PRESETS = [
  { label: "Under 50K", min: "", max: "50000" },
  { label: "50K - 150K", min: "50000", max: "150000" },
  { label: "150K - 300K", min: "150000", max: "300000" },
  { label: "300K+", min: "300000", max: "" },
];

function hrefFor(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  const merged = { ...searchParams, ...overrides, page: undefined };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function ProductFilters(props: Readonly<ProductFiltersProps>) {
  const dialogRef = useRef<DialogHandle>(null);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button variant="outline" size="sm" className="gap-2 font-medium" onClick={() => dialogRef.current?.open()}>
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          Filter Equipment
        </Button>
      </div>

      {/* Mobile Drawer Dialog */}
      <Dialog ref={dialogRef} className="max-w-md p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-foreground">Filter Equipment</h2>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-neutral-400 hover:bg-surface-muted hover:text-foreground"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="pt-4">
          <FilterPanel {...props} />
        </div>
      </Dialog>

      {/* Desktop Sidebar Panel */}
      <aside className="hidden w-72 shrink-0 flex-col gap-6 lg:flex">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <FilterPanel {...props} />
        </div>
      </aside>
    </>
  );
}

function FilterPanel({
  basePath,
  searchParams,
  categories,
  brands,
  activeCategorySlug,
  activeBrandSlug,
}: Readonly<ProductFiltersProps>) {
  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState(searchParams.min ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.max ?? "");

  // Expand category tree if active slug belongs to it
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      const isSubActive = cat.children.some((c) => c.slug === activeCategorySlug);
      if (cat.slug === activeCategorySlug || isSubActive) {
        initial[cat.id] = true;
      } else {
        initial[cat.id] = false;
      }
    }
    return initial;
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const hasActiveFilters =
    Boolean(activeCategorySlug) ||
    Boolean(activeBrandSlug) ||
    Boolean(searchParams.min) ||
    Boolean(searchParams.max) ||
    Boolean(searchParams.q);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Reset Row */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
          Filter Options
        </h3>
        {hasActiveFilters && (
          <Link
            href={basePath}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Link>
        )}
      </div>

      {/* Hierarchical Categories Accordion */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Categories</span>
            <Layers className="h-3.5 w-3.5 text-neutral-400" />
          </h4>
          <div className="flex flex-col gap-0.5">
            <Link
              href={hrefFor(basePath, searchParams, { category: undefined })}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                !activeCategorySlug
                  ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-200"
                  : "text-foreground hover:bg-surface-muted"
              )}
            >
              <span>All Categories</span>
            </Link>

            {categories.map((category) => {
              const isParentActive = activeCategorySlug === category.slug;
              const hasChildren = category.children.length > 0;
              const isExpanded = Boolean(expandedCategories[category.id]);
              const containsActiveChild = category.children.some((c) => c.slug === activeCategorySlug);
              const parentLinkTone = isParentActive
                ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-200"
                : containsActiveChild
                  ? "font-semibold text-brand-600"
                  : "text-foreground hover:bg-surface-muted";

              return (
                <div key={category.id} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link
                      href={hrefFor(basePath, searchParams, { category: category.slug })}
                      className={cn(
                        "flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                        parentLinkTone,
                      )}
                    >
                      <span className="truncate">{category.name}</span>
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 text-neutral-400 hover:text-foreground"
                        aria-label="Toggle subcategories"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub-category list */}
                  {hasChildren && isExpanded && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l border-border/60 pl-2.5 pt-1">
                      {category.children.map((child) => {
                        const isChildActive = activeCategorySlug === child.slug;
                        return (
                          <Link
                            key={child.id}
                            href={hrefFor(basePath, searchParams, { category: child.slug })}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                              isChildActive
                                ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-200"
                                : "text-neutral-600 hover:bg-surface-muted dark:text-neutral-300"
                            )}
                          >
                            <span className="truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands List with Search */}
      {brands.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4 className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Brands</span>
            <Tag className="h-3.5 w-3.5 text-neutral-400" />
          </h4>

          {/* Quick Search */}
          {brands.length > 6 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search brands…"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <Link
              href={hrefFor(basePath, searchParams, { brand: undefined })}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                !activeBrandSlug
                  ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-200"
                  : "text-foreground hover:bg-surface-muted"
              )}
            >
              <span>All Brands</span>
            </Link>

            {filteredBrands.map((brand) => {
              const isActive = activeBrandSlug === brand.slug;
              return (
                <Link
                  key={brand.id}
                  href={hrefFor(basePath, searchParams, { brand: brand.slug })}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-200"
                      : "text-foreground hover:bg-surface-muted"
                  )}
                >
                  <span className="truncate">{brand.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range & Presets */}
      <form method="get" action={basePath} className="flex flex-col gap-3.5 border-t border-border/80 pt-4">
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        {searchParams.brand && <input type="hidden" name="brand" value={searchParams.brand} />}
        {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}

        <h4 className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
          <span>Price Range (Ksh)</span>
          <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
        </h4>

        {/* Quick Budget Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMinPrice(preset.min);
                setMaxPrice(preset.max);
              }}
              className={cn(
                "rounded-lg border px-2 py-1 text-center text-[10px] font-medium transition-colors",
                minPrice === preset.min && maxPrice === preset.max
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200"
                  : "border-border/80 bg-surface-muted/40 text-neutral-600 hover:border-brand-300 dark:text-neutral-300"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Min / Max Input Fields */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            name="min"
            placeholder="Min Ksh"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
            className="h-8 text-xs"
          />
          <span className="text-neutral-400 text-xs">-</span>
          <Input
            type="number"
            name="max"
            placeholder="Max Ksh"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
            className="h-8 text-xs"
          />
        </div>

        {/* Sort Dropdown */}
        <h4 className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">Sort Order</h4>
        <Select name="sort" defaultValue={searchParams.sort ?? "newest"} className="h-9 text-xs">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Button type="submit" size="sm" className="mt-1 gap-2 font-medium">
          Apply Filters
        </Button>
      </form>
    </div>
  );
}
