"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import {
  quotationLineItemSchema,
  quotationChargesSchema,
  quotationTermsSchema,
  quotationStatusSchema,
  TERMINAL_QUOTATION_STATUSES,
} from "./schemas";

type FormState = { error: string } | undefined;
type DbClient = typeof db | Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function assertEditable(client: DbClient, quotationId: string): Promise<void> {
  const quotation = await client.quotation.findUniqueOrThrow({ where: { id: quotationId }, select: { status: true } });
  if ((TERMINAL_QUOTATION_STATUSES as readonly string[]).includes(quotation.status)) {
    throw new Error("This quotation is locked — its status can no longer be changed.");
  }
}

/** Subtotal always derives from current line items; total layers the charge fields on top. Called after any item or charges change. */
async function recomputeQuotationTotals(client: DbClient, quotationId: string): Promise<void> {
  const [items, quotation] = await Promise.all([
    client.quotationItem.findMany({ where: { quotationId } }),
    client.quotation.findUniqueOrThrow({ where: { id: quotationId } }),
  ]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const discountTotal = Number(quotation.discountTotal ?? 0);
  const installationCharge = Number(quotation.installationCharge ?? 0);
  const deliveryCharge = Number(quotation.deliveryCharge ?? 0);
  const taxTotal = Number(quotation.taxTotal ?? 0);
  const total = subtotal - discountTotal + installationCharge + deliveryCharge + taxTotal;

  await client.quotation.update({ where: { id: quotationId }, data: { subtotal, total } });
}

function parseLineItemForm(formData: FormData) {
  return quotationLineItemSchema.safeParse({
    productId: formData.get("productId") || undefined,
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });
}

export async function addQuotationItem(quotationId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("quotations.manage");
  await assertEditable(db, quotationId);

  const parsed = parseLineItemForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the line item and try again." };
  }
  const data = parsed.data;

  await db.quotationItem.create({
    data: {
      quotationId,
      productId: data.productId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      lineTotal: data.quantity * data.unitPrice,
    },
  });

  await recomputeQuotationTotals(db, quotationId);
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function updateQuotationItem(itemId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("quotations.manage");

  const item = await db.quotationItem.findUnique({ where: { id: itemId }, select: { quotationId: true } });
  if (!item) return { error: "Line item not found." };
  await assertEditable(db, item.quotationId);

  const parsed = parseLineItemForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the line item and try again." };
  }
  const data = parsed.data;

  await db.quotationItem.update({
    where: { id: itemId },
    data: {
      productId: data.productId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      lineTotal: data.quantity * data.unitPrice,
    },
  });

  await recomputeQuotationTotals(db, item.quotationId);
  revalidatePath(`/admin/quotations/${item.quotationId}`);
}

export async function removeQuotationItem(itemId: string): Promise<void> {
  await requirePermission("quotations.manage");

  const item = await db.quotationItem.findUnique({ where: { id: itemId }, select: { quotationId: true } });
  if (!item) return;
  await assertEditable(db, item.quotationId);

  await db.quotationItem.delete({ where: { id: itemId } });
  await recomputeQuotationTotals(db, item.quotationId);
  revalidatePath(`/admin/quotations/${item.quotationId}`);
}

export async function updateQuotationCommercials(
  quotationId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const staff = await requirePermission("quotations.manage");
  await assertEditable(db, quotationId);

  const chargesParsed = quotationChargesSchema.safeParse({
    discountTotal: formData.get("discountTotal"),
    installationCharge: formData.get("installationCharge"),
    deliveryCharge: formData.get("deliveryCharge"),
    taxTotal: formData.get("taxTotal"),
  });
  if (!chargesParsed.success) {
    return { error: chargesParsed.error.issues[0]?.message ?? "Please check the financial charges." };
  }

  const termsParsed = quotationTermsSchema.safeParse({
    termsAndConditions: formData.get("termsAndConditions") || undefined,
    paymentTerms: formData.get("paymentTerms") || undefined,
    warrantyInfo: formData.get("warrantyInfo") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!termsParsed.success) {
    return { error: termsParsed.error.issues[0]?.message ?? "Please check the quotation terms." };
  }

  const charges = chargesParsed.data;
  const terms = termsParsed.data;

  await db.quotation.update({
    where: { id: quotationId },
    data: {
      discountTotal: charges.discountTotal,
      installationCharge: charges.installationCharge,
      deliveryCharge: charges.deliveryCharge,
      taxTotal: charges.taxTotal,
      termsAndConditions: terms.termsAndConditions,
      paymentTerms: terms.paymentTerms,
      warrantyInfo: terms.warrantyInfo,
      expiresAt: terms.expiresAt ? new Date(terms.expiresAt) : null,
      preparedById: staff.id,
    },
  });

  await recomputeQuotationTotals(db, quotationId);
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function updateQuotationCharges(
  quotationId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const staff = await requirePermission("quotations.manage");
  await assertEditable(db, quotationId);

  const parsed = quotationChargesSchema.safeParse({
    discountTotal: formData.get("discountTotal"),
    installationCharge: formData.get("installationCharge"),
    deliveryCharge: formData.get("deliveryCharge"),
    taxTotal: formData.get("taxTotal"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the charges and try again." };
  }
  const data = parsed.data;

  await db.quotation.update({
    where: { id: quotationId },
    data: {
      discountTotal: data.discountTotal,
      installationCharge: data.installationCharge,
      deliveryCharge: data.deliveryCharge,
      taxTotal: data.taxTotal,
      preparedById: staff.id,
    },
  });

  await recomputeQuotationTotals(db, quotationId);
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function updateQuotationTerms(
  quotationId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const staff = await requirePermission("quotations.manage");
  await assertEditable(db, quotationId);

  const parsed = quotationTermsSchema.safeParse({
    termsAndConditions: formData.get("termsAndConditions") || undefined,
    paymentTerms: formData.get("paymentTerms") || undefined,
    warrantyInfo: formData.get("warrantyInfo") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the terms and try again." };
  }
  const data = parsed.data;

  await db.quotation.update({
    where: { id: quotationId },
    data: {
      termsAndConditions: data.termsAndConditions,
      paymentTerms: data.paymentTerms,
      warrantyInfo: data.warrantyInfo,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      preparedById: staff.id,
    },
  });

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function updateQuotationStatus(
  quotationId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const staff = await requirePermission("quotations.manage");
  await assertEditable(db, quotationId);

  const parsed = quotationStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) {
    return { error: "Select a valid status." };
  }

  await db.quotation.update({
    where: { id: quotationId },
    data: { status: parsed.data.status, preparedById: staff.id },
  });

  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
}
