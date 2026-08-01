import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getInventoryItemDetail } from "@/modules/inventory/queries";
import { buttonVariants } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/inventory" className="flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">{product.name}</h1>
          <span className="text-xs text-neutral-500">SKU {product.sku}</span>
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
