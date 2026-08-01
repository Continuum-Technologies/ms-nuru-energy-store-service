import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileEdit } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getInventoryItemDetail } from "@/modules/inventory/queries";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { InventoryItemSummary } from "./_components/inventory-item-summary";
import { InventoryMovementHistory } from "./_components/inventory-movement-history";
import { InventoryActions } from "./_components/inventory-actions";

interface InventoryDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function InventoryDetailPage({ params }: Readonly<InventoryDetailPageProps>) {
  await requirePermissionOrRedirect("inventory.view");
  const { productId } = await params;

  const detail = await getInventoryItemDetail(productId);
  if (!detail) notFound();

  const { product, movements } = detail;
  const item = product.inventoryItem;

  const available = item ? item.quantityOnHand - item.reservedQuantity : 0;
  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "not_tracked" = "not_tracked";
  if (item) {
    if (available <= 0) stockStatus = "out_of_stock";
    else if (item.quantityOnHand <= item.reorderLevel) stockStatus = "low_stock";
    else stockStatus = "in_stock";
  }

  const STATUS_LABEL = {
    in_stock: "In Stock",
    low_stock: "Low Stock Warning",
    out_of_stock: "Out of Stock",
    not_tracked: "Not Tracked",
  };

  const STATUS_TONE: Record<typeof stockStatus, "success" | "warning" | "danger" | "neutral"> = {
    in_stock: "success",
    low_stock: "warning",
    out_of_stock: "danger",
    not_tracked: "neutral",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/inventory"
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory Ledger
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <Badge tone={STATUS_TONE[stockStatus]}>{STATUS_LABEL[stockStatus]}</Badge>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 bg-surface-muted px-2 py-0.5 rounded">
              SKU: {product.sku}
            </span>
            <span className="text-xs text-neutral-500">{product.category.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 font-bold" })}
            >
              <FileEdit className="h-4 w-4" />
              Edit Product
            </Link>
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 font-semibold text-neutral-600 hover:text-brand-600" })}
            >
              <ExternalLink className="h-4 w-4" />
              Storefront View
            </a>
          </div>
        </div>
      </div>

      {!product.inventoryItem ? (
        <EmptyState
          title="Stock isn't tracked for this product yet"
          description="Set an opening quantity from the product's edit page to start tracking it here."
          action={
            <Link href={`/admin/products/${product.id}/edit`} className={buttonVariants({ size: "sm" })}>
              Open Product Edit Page
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <InventoryItemSummary
              productId={product.id}
              quantityOnHand={product.inventoryItem.quantityOnHand}
              reservedQuantity={product.inventoryItem.reservedQuantity}
              reorderLevel={product.inventoryItem.reorderLevel}
              lowStockThreshold={product.inventoryItem.lowStockThreshold}
              allowBackorder={product.inventoryItem.allowBackorder}
              lastCountedAt={product.inventoryItem.lastCountedAt}
            />
            <InventoryMovementHistory
              movements={movements.map((movement) => ({
                id: movement.id,
                type: movement.type,
                quantityChange: movement.quantityChange,
                previousQuantity: movement.previousQuantity,
                newQuantity: movement.newQuantity,
                reason: movement.reason,
                reference: movement.reference,
                order: movement.order,
                performedByName: movement.performedBy?.name ?? null,
                createdAt: movement.createdAt,
              }))}
            />
          </div>

          <div className="lg:col-span-1">
            <InventoryActions productId={product.id} reservedQuantity={product.inventoryItem.reservedQuantity} />
          </div>
        </div>
      )}
    </div>
  );
}
