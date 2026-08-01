import Link from "next/link";
import { Boxes, AlertTriangle, PackageX, PackageSearch } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getInventoryList, getInventoryStats } from "@/modules/inventory/queries";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";

interface InventoryRow {
  id: string;
  name: string;
  sku: string;
  tracked: boolean;
  quantityOnHand: number;
  reservedQuantity: number;
  available: number;
  reorderLevel: number;
  lastCountedAt: Date | null;
}

type StockStatus = "not_tracked" | "out_of_stock" | "low_stock" | "in_stock";

function getStockStatus(row: InventoryRow): StockStatus {
  if (!row.tracked) return "not_tracked";
  if (row.available <= 0) return "out_of_stock";
  if (row.quantityOnHand <= row.reorderLevel) return "low_stock";
  return "in_stock";
}

const STATUS_LABEL: Record<StockStatus, string> = {
  not_tracked: "Not Tracked",
  out_of_stock: "Out of Stock",
  low_stock: "Low Stock",
  in_stock: "In Stock",
};

const STATUS_TONE: Record<StockStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  not_tracked: "neutral",
  out_of_stock: "danger",
  low_stock: "warning",
  in_stock: "success",
};

export default async function InventoryPage() {
  await requirePermissionOrRedirect("inventory.view");

  const [products, stats] = await Promise.all([getInventoryList(), getInventoryStats()]);

  const rows: InventoryRow[] = products.map((product) => {
    const item = product.inventoryItem;
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      tracked: item !== null,
      quantityOnHand: item?.quantityOnHand ?? 0,
      reservedQuantity: item?.reservedQuantity ?? 0,
      available: (item?.quantityOnHand ?? 0) - (item?.reservedQuantity ?? 0),
      reorderLevel: item?.reorderLevel ?? 0,
      lastCountedAt: item?.lastCountedAt ?? null,
    };
  });

  const columns: DataListColumn<InventoryRow>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <Link href={`/admin/inventory/${row.id}`} className="font-medium text-foreground hover:text-brand-600">
          {row.name}
        </Link>
      ),
    },
    { key: "sku", header: "SKU", hideOnMobile: true, render: (row) => <span className="text-neutral-500">{row.sku}</span> },
    { key: "onHand", header: "On Hand", render: (row) => (row.tracked ? row.quantityOnHand : "—") },
    { key: "reserved", header: "Reserved", hideOnMobile: true, render: (row) => (row.tracked ? row.reservedQuantity : "—") },
    { key: "available", header: "Available", render: (row) => (row.tracked ? row.available : "—") },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const status = getStockStatus(row);
        return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
      },
    },
    {
      key: "lastCounted",
      header: "Last Counted",
      hideOnMobile: true,
      render: (row) => (row.lastCountedAt ? new Date(row.lastCountedAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" }) : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Inventory</h1>
        <p className="text-sm text-neutral-500">Track stock levels, receive shipments, and log damage, loss, and counts.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <KpiCard title="Tracked Products" value={stats.totalTracked} subtitle="With stock records" icon={<Boxes className="h-4 w-4 sm:h-5 sm:w-5" />} tone="brand" />
        <KpiCard title="Low Stock" value={stats.lowStock} subtitle="At or below reorder level" icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />} tone="warning" />
        <KpiCard title="Out of Stock" value={stats.outOfStock} subtitle={stats.outOfStock > 0 ? "Needs restocking" : "All available"} icon={<PackageX className="h-4 w-4 sm:h-5 sm:w-5" />} tone="danger" />
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[getStockStatus(row)]}>{STATUS_LABEL[getStockStatus(row)]}</Badge>}
        emptyState={
          <EmptyState
            title="No products yet"
            description="Add products from the catalog to start tracking stock."
            action={<PackageSearch className="h-5 w-5 text-neutral-400" />}
          />
        }
      />
    </div>
  );
}
