"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { getStoreSettings } from "./queries";
import { storeSettingsSchema, paymentDisplaySettingsSchema } from "./schemas";

export type SettingsFormState = { success?: boolean; error?: string } | undefined;

export async function updateStoreSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const actor = await requirePermission("settings.manage");

  const parsed = storeSettingsSchema.safeParse({
    businessName: formData.get("businessName"),
    logoUrl: formData.get("logoUrl") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    county: formData.get("county") || undefined,
    businessHours: formData.get("businessHours") || undefined,
    facebookUrl: formData.get("facebookUrl") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    tiktokUrl: formData.get("tiktokUrl") || undefined,
    currency: formData.get("currency") || undefined,
    vatRate: formData.get("vatRate"),
    pricesIncludeVat: formData.get("pricesIncludeVat") === "on",
    deliveryInfo: formData.get("deliveryInfo") || undefined,
    collectionInfo: formData.get("collectionInfo") || undefined,
    warrantyPolicySummary: formData.get("warrantyPolicySummary") || undefined,
    returnPolicySummary: formData.get("returnPolicySummary") || undefined,
    quotationTermsDefault: formData.get("quotationTermsDefault") || undefined,
    orderNotificationEmails: formData.get("orderNotificationEmails") || undefined,
    lowStockThresholdDefault: formData.get("lowStockThresholdDefault"),
    seoTitleSuffix: formData.get("seoTitleSuffix") || undefined,
    seoDefaultDescription: formData.get("seoDefaultDescription") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const before = await getStoreSettings();
  const data = parsed.data;

  await db.storeSettings.update({
    where: { id: before.id },
    data: { ...data, updatedById: actor.id },
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "settings.update",
      entityType: "StoreSettings",
      entityId: before.id,
      // structuredClone() throws on this object — `before.vatRate` is a
      // Prisma Decimal instance, which isn't structured-clone-compatible.
      // JSON.stringify correctly serializes it via Decimal's toJSON().
      previousValue: JSON.parse(JSON.stringify(before)),
      newValue: data,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePaymentDisplaySettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const actor = await requirePermission("payments.settings.manage");

  const parsed = paymentDisplaySettingsSchema.safeParse({
    mpesaPaybill: formData.get("mpesaPaybill") || undefined,
    mpesaTill: formData.get("mpesaTill") || undefined,
    bankName: formData.get("bankName") || undefined,
    bankAccountName: formData.get("bankAccountName") || undefined,
    bankAccountNumber: formData.get("bankAccountNumber") || undefined,
    bankBranch: formData.get("bankBranch") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const before = await getStoreSettings();
  const data = parsed.data;

  await db.storeSettings.update({
    where: { id: before.id },
    data: { ...data, updatedById: actor.id },
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "settings.payment_details.update",
      entityType: "StoreSettings",
      entityId: before.id,
      previousValue: {
        mpesaPaybill: before.mpesaPaybill,
        mpesaTill: before.mpesaTill,
        bankName: before.bankName,
        bankAccountName: before.bankAccountName,
        bankAccountNumber: before.bankAccountNumber,
        bankBranch: before.bankBranch,
      },
      newValue: data,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
