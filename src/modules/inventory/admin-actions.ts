"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import {
  stockMovementSchema,
  receiveStockSchema,
  stockCountSchema,
  reorderSettingsSchema,
  manualReleaseSchema,
} from "./schemas";
import type { InventoryMovementType } from "@/generated/prisma/client";

type FormState = { error: string } | undefined;

async function requireInventoryItem(productId: string) {
  return db.inventoryItem.findUnique({ where: { productId } });
}

/** Shared by every "adjust by a signed amount" action — writes the movement, updates the one field it's responsible for. */
async function applyQuantityOnHandChange(
  productId: string,
  delta: number,
  type: InventoryMovementType,
  performedById: string,
  reason?: string,
  reference?: string,
): Promise<FormState> {
  const inventoryItem = await requireInventoryItem(productId);
  if (!inventoryItem) {
    return { error: "This product has no stock record yet — set an opening quantity from its edit page first." };
  }

  const previousQuantity = inventoryItem.quantityOnHand;
  const newQuantity = previousQuantity + delta;

  // Reject rather than silently clamp to 0 — clamping would record a
  // quantityChange that doesn't match what was actually requested, making
  // the audit trail lie about the true magnitude of the movement.
  if (newQuantity < 0) {
    return { error: `Only ${previousQuantity} unit(s) are on hand — can't record a change of ${delta}.` };
  }

  await db.$transaction([
    db.inventoryItem.update({ where: { id: inventoryItem.id }, data: { quantityOnHand: newQuantity } }),
    db.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId,
        type,
        quantityChange: newQuantity - previousQuantity,
        previousQuantity,
        newQuantity,
        reason,
        reference,
        performedById,
      },
    }),
  ]);

  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function receiveStock(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = receiveStockSchema.safeParse({
    quantity: formData.get("quantity"),
    reference: formData.get("reference") || undefined,
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid quantity." };
  }

  return applyQuantityOnHandChange(productId, parsed.data.quantity, "STOCK_RECEIVED", staff.id, parsed.data.reason, parsed.data.reference);
}

export async function recordDamagedStock(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = stockMovementSchema.safeParse({ quantity: formData.get("quantity"), reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid quantity and reason." };
  }

  return applyQuantityOnHandChange(productId, -parsed.data.quantity, "DAMAGED_STOCK", staff.id, parsed.data.reason);
}

export async function recordLostStock(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = stockMovementSchema.safeParse({ quantity: formData.get("quantity"), reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid quantity and reason." };
  }

  return applyQuantityOnHandChange(productId, -parsed.data.quantity, "LOST_STOCK", staff.id, parsed.data.reason);
}

export async function recordSupplierReturn(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = stockMovementSchema.safeParse({ quantity: formData.get("quantity"), reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid quantity and reason." };
  }

  return applyQuantityOnHandChange(productId, -parsed.data.quantity, "SUPPLIER_RETURN", staff.id, parsed.data.reason);
}

/** Distinct from a manual adjustment — this is a physical stock count reconciliation, so it also updates `lastCountedAt`. */
export async function recordStockCount(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = stockCountSchema.safeParse({
    countedQuantity: formData.get("countedQuantity"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid counted quantity." };
  }

  const inventoryItem = await requireInventoryItem(productId);
  if (!inventoryItem) {
    return { error: "This product has no stock record yet — set an opening quantity from its edit page first." };
  }

  const previousQuantity = inventoryItem.quantityOnHand;
  const newQuantity = parsed.data.countedQuantity;

  await db.$transaction([
    db.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantityOnHand: newQuantity, lastCountedAt: new Date() },
    }),
    db.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId,
        type: "STOCK_COUNT_CORRECTION",
        quantityChange: newQuantity - previousQuantity,
        previousQuantity,
        newQuantity,
        reason: parsed.data.reason,
        performedById: staff.id,
      },
    }),
  ]);

  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function updateReorderSettings(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("inventory.adjust");

  const parsed = reorderSettingsSchema.safeParse({
    reorderLevel: formData.get("reorderLevel"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    allowBackorder: formData.get("allowBackorder") === "on",
  });
  if (!parsed.success) {
    return { error: "Please check the reorder settings and try again." };
  }

  const inventoryItem = await requireInventoryItem(productId);
  if (!inventoryItem) {
    return { error: "This product has no stock record yet — set an opening quantity from its edit page first." };
  }

  await db.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: {
      reorderLevel: parsed.data.reorderLevel,
      lowStockThreshold: parsed.data.lowStockThreshold,
      allowBackorder: parsed.data.allowBackorder,
    },
  });

  revalidatePath(`/admin/inventory/${productId}`);
}

/** Targeted fix for a stuck/out-of-sync reservation — distinct from `cancelOrder`'s full order cancellation, which uses `ORDER_CANCELLATION` instead. */
export async function releaseReservationManually(productId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const staff = await requirePermission("inventory.adjust");

  const parsed = manualReleaseSchema.safeParse({ quantity: formData.get("quantity"), reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid quantity and reason." };
  }

  const inventoryItem = await requireInventoryItem(productId);
  if (!inventoryItem) {
    return { error: "This product has no stock record yet." };
  }
  if (parsed.data.quantity > inventoryItem.reservedQuantity) {
    return { error: `Only ${inventoryItem.reservedQuantity} unit(s) are currently reserved.` };
  }

  const previousQuantity = inventoryItem.reservedQuantity;
  const newQuantity = previousQuantity - parsed.data.quantity;

  await db.$transaction([
    db.inventoryItem.update({ where: { id: inventoryItem.id }, data: { reservedQuantity: newQuantity } }),
    db.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        productId,
        type: "RESERVATION_RELEASED",
        quantityChange: -parsed.data.quantity,
        previousQuantity,
        newQuantity,
        reason: parsed.data.reason,
        performedById: staff.id,
      },
    }),
  ]);

  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/inventory");
}
