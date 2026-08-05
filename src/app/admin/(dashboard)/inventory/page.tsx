import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  SlidersHorizontal,
  FileEdit,
  Layers,
} from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getInventoryList, getInventoryStats } from "@/modules/inventory/queries";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminSearchInput } from "@/app/admin/(dashboard)/_components/admin-search-input";
import { cn } from "@/lib/cn";

import type { ProductStatus } from "@/generated/prisma/client";

interface InventoryRow {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  productStatus: ProductStatus;
  tracked: boolean;
  quantityOnHand: number;
  reservedQuantity: number;
  available: number;
  reorderLevel: number;
  lastCountedAt: Date | null;
}

type StockStatusFilter = "all" | "low_stock" | "out_of_stock" | "in_stock" | "not_tracked";

function getStockStatus(row: InventoryRow): StockStatusFilter {
  if (!row.tracked) return "not_tracked";
  if (row.available <= 0) return "out_of_stock";
  if (row.quantityOnHand <= row.reorderLevel) return "low_stock";
  return "in_stock";
}

const STATUS_LABEL: Record<StockStatusFilter, string> = {
  all: "All Records",
  not_tracked: "Not Tracked",
  out_of_stock: "Out of Stock",
  low_stock: "Low Stock",
  in_stock: "In Stock",
};

const STATUS_TONE: Record<StockStatusFilter, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  all: "neutral",
  not_tracked: "neutral",
  out_of_stock: "danger",
  low_stock: "warning",
  in_stock: "success",
};

const PRODUCT_STATUS_TONE: Record<ProductStatus, "success" | "neutral" | "warning" | "danger"> = {
  ACTIVE: "success",
  DRAFT: "neutral",
  HIDDEN: "neutral",
  AVAILABLE_ON_ORDER: "warning",
  OUT_OF_STOCK: "danger",
  DISCONTINUED: "danger",
  ARCHIVED: "neutral",
};

function buildInventoryUrl(params: { catalog?: string; status?: string; q?: string }): string {
  const searchParams = new URLSearchParams();
  if (params.catalog && params.catalog !== "all") {
    searchParams.set("catalog", params.catalog);
  }
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.q) {
    searchParams.set("q", params.q);
  }
  const queryString = searchParams.toString();
  return queryString ? `/admin/inventory?${queryString}` : "/admin/inventory";
}

interface InventoryPageProps {
  searchParams?: Promise<{ page?: string; status?: string; catalog?: string; q?: string }>;
}

export default async function InventoryPage({ searchParams }: Readonly<InventoryPageProps>) {
  await requirePermissionOrRedirect("inventory.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const activeStatus = (resolvedSearchParams?.status as StockStatusFilter) || "all";
  const catalogFilter = resolvedSearchParams?.catalog || "all";
  const searchQuery = (resolvedSearchParams?.q || "").toLowerCase().trim();

  const [products, stats] = await Promise.all([getInventoryList(), getInventoryStats()]);

  const allRows: InventoryRow[] = products.map((product) => {
    const item = product.inventoryItem;
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryName: product.category.name,
      productStatus: product.status,
      tracked: item !== null,
      quantityOnHand: item?.quantityOnHand ?? 0,
      reservedQuantity: item?.reservedQuantity ?? 0,
      available: (item?.quantityOnHand ?? 0) - (item?.reservedQuantity ?? 0),
      reorderLevel: item?.reorderLevel ?? 0,
      lastCountedAt: item?.lastCountedAt ?? null,
    };
  });

  // Filter rows based on status tab, catalog status, & search query
  const filteredRows = allRows.filter((row) => {
    const rowStatus = getStockStatus(row);
    const matchesStatus = activeStatus === "all" || rowStatus === activeStatus;
    const matchesCatalog =
      catalogFilter === "all" ||
      (catalogFilter === "active" && row.productStatus === "ACTIVE") ||
      (catalogFilter === "draft" && row.productStatus === "DRAFT");

    const matchesSearch =
      !searchQuery ||
      row.name.toLowerCase().includes(searchQuery) ||
      row.sku.toLowerCase().includes(searchQuery) ||
      row.categoryName.toLowerCase().includes(searchQuery) ||
      row.productStatus.toLowerCase().includes(searchQuery);

    return matchesStatus && matchesCatalog && matchesSearch;
  });

  const columns: DataListColumn<InventoryRow>[] = [
    {
      key: "product",
      header: "Product & Category",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/inventory/${row.id}`}
              className="font-semibold text-foreground hover:text-brand-600 transition-colors"
            >
              {row.name}
            </Link>
            <Badge tone={PRODUCT_STATUS_TONE[row.productStatus]}>
              {row.productStatus.replaceAll("_", " ")}
            </Badge>
          </div>
          <span className="text-xs text-neutral-500">{row.categoryName}</span>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      hideOnMobile: true,
      render: (row) => <span className="font-mono text-xs text-neutral-500">{row.sku}</span>,
    },
    {
      key: "onHand",
      header: "On Hand",
      render: (row) =>
        row.tracked ? (
          <span className="font-semibold text-foreground">{row.quantityOnHand.toLocaleString("en-KE")}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "reserved",
      header: "Reserved",
      hideOnMobile: true,
      render: (row) => {
        if (!row.tracked) return <span className="text-neutral-400">—</span>;
        if (row.reservedQuantity > 0) {
          return (
            <span className="text-xs font-semibold text-warning-700 dark:text-warning-300">
              {row.reservedQuantity.toLocaleString("en-KE")} allocated
            </span>
          );
        }
        return <span className="text-xs text-neutral-400">0</span>;
      },
    },
    {
      key: "available",
      header: "Available",
      render: (row) =>
        row.tracked ? (
          <span className="font-bold text-xs text-foreground">{row.available.toLocaleString("en-KE")}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "reorderLevel",
      header: "Reorder At",
      hideOnMobile: true,
      render: (row) =>
        row.tracked ? (
          <span className="text-xs font-mono text-neutral-500">{row.reorderLevel} units</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const status = getStockStatus(row);
        return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/inventory/${row.id}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
            title="Manage stock & view movement history"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Stock Ops
          </Link>
          <Link
            href={`/admin/products/${row.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1 text-neutral-500 hover:text-brand-600" })}
            title="Edit product parameters"
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
        </div>
      ),
    },
  ];

  const statusFilters: { id: StockStatusFilter; label: string; count?: number }[] = [
    { id: "all", label: "All Products", count: allRows.length },
    { id: "low_stock", label: "Low Stock", count: stats.lowStock },
    { id: "out_of_stock", label: "Out of Stock", count: stats.outOfStock },
    { id: "in_stock", label: "In Stock", count: stats.inStock },
    { id: "not_tracked", label: "Not Tracked", count: allRows.length - stats.totalTracked },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory Ledger</h1>
          <p className="text-sm text-neutral-500">
            Track live warehouse & store stock levels, monitor reorder points, receive stock, and audit physical counts.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/admin/products" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 font-bold" })}>
            <Layers className="h-4 w-4" />
            Manage Catalog
          </Link>
        </div>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          title="Tracked Products"
          value={stats.totalTracked}
          subtitle={`${stats.totalUnits.toLocaleString("en-KE")} total units on hand`}
          icon={<Boxes className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="brand"
        />
        <KpiCard
          title="In Stock"
          value={stats.inStock}
          subtitle="Healthy stock levels"
          icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="success"
        />
        <KpiCard
          title="Low Stock Warning"
          value={stats.lowStock}
          subtitle="At or below reorder level"
          icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="warning"
        />
        <KpiCard
          title="Out of Stock Alert"
          value={stats.outOfStock}
          subtitle={stats.outOfStock > 0 ? "Replenish immediately" : "Zero stockouts"}
          icon={<PackageX className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="danger"
        />
      </div>

      {/* Status Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <AdminSearchInput placeholder="Search inventory by product, SKU, or category..." />

        <div className="flex flex-wrap items-center gap-3">
          {/* Catalog Publication Scope filter */}
          <div className="flex items-center rounded-xl bg-surface-muted p-1 text-xs">
            <Link
              href={buildInventoryUrl({ catalog: "all", status: activeStatus, q: searchQuery })}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-all",
                catalogFilter === "all" ? "bg-surface text-foreground shadow-xs" : "text-neutral-500 hover:text-foreground",
              )}
            >
              All Catalog
            </Link>
            <Link
              href={buildInventoryUrl({ catalog: "active", status: activeStatus, q: searchQuery })}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-all",
                catalogFilter === "active" ? "bg-surface text-foreground shadow-xs" : "text-neutral-500 hover:text-foreground",
              )}
            >
              Active Storefront
            </Link>
            <Link
              href={buildInventoryUrl({ catalog: "draft", status: activeStatus, q: searchQuery })}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-all",
                catalogFilter === "draft" ? "bg-surface text-foreground shadow-xs" : "text-neutral-500 hover:text-foreground",
              )}
            >
              Drafts
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={buildInventoryUrl({ catalog: catalogFilter, status: tab.id, q: searchQuery })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm dark:bg-brand-500"
                      : "bg-surface-muted text-neutral-600 hover:bg-surface-muted/80 dark:text-neutral-300",
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory Data List */}
      <DataList
        page={page}
        columns={columns}
        rows={filteredRows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[getStockStatus(row)]}>{STATUS_LABEL[getStockStatus(row)]}</Badge>}
        emptyState={
          <EmptyState
            title="No inventory records found"
            description="No products match the selected stock status filter."
            action={
              <Link href="/admin/inventory" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Reset Filters
              </Link>
            }
          />
        }
      />
    </div>
  );
}
