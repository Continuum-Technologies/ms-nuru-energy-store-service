"use server";

import { db } from "@/infrastructure/database/client";
import { getCartWithItems } from "@/modules/cart/queries";
import { getProductBySlug } from "@/modules/catalog/queries";
import { getOrCreateCustomer } from "@/modules/customers/actions";
import { generateReferenceNumber } from "@/lib/reference-number";
import { quotationRequestSchema } from "./schemas";

type FormState = { error: string } | { success: true; quotationNumber: string } | undefined;

/**
 * Public — no permission gate, this is the customer-facing request form.
 * Re-derives any product/cart context server-side from `contextSource`/
 * `contextProductSlug` rather than trusting client-submitted price/product
 * data, matching how `submitOrder` never trusts a client-supplied price.
 * Pricing stays unset (`subtotal`/`total` null) until staff prepare the
 * quotation — a seeded `QuotationItem`'s `unitPrice` is just today's
 * reference price, not a locked total.
 */
export async function requestQuotation(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = quotationRequestSchema.safeParse({
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    guestEmail: formData.get("guestEmail") || undefined,
    productInterest: formData.get("productInterest") || undefined,
    quantity: formData.get("quantity") || 1,
    intendedUse: formData.get("intendedUse") || undefined,
    propertyType: formData.get("propertyType") || undefined,
    currentPowerSource: formData.get("currentPowerSource") || undefined,
    installationRequired: formData.get("installationRequired") === "on",
    budgetRange: formData.get("budgetRange") || undefined,
    preferredCompletionDate: formData.get("preferredCompletionDate") || undefined,
    customerNotes: formData.get("customerNotes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  const contextSource = formData.get("contextSource");
  const contextProductSlug = formData.get("contextProductSlug");

  const seededItems: { productId: string; description: string; quantity: number; unitPrice: number }[] = [];

  if (contextSource === "product" && typeof contextProductSlug === "string") {
    const product = await getProductBySlug(contextProductSlug);
    if (product) {
      seededItems.push({
        productId: product.id,
        description: product.name,
        quantity: data.quantity,
        unitPrice: Number(product.sellingPrice),
      });
    }
  } else if (contextSource === "cart") {
    const cart = await getCartWithItems();
    for (const item of cart.items) {
      seededItems.push({
        productId: item.product.id,
        description: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.product.sellingPrice),
      });
    }
  }

  const quotationNumber = await generateReferenceNumber("NQ", async (candidate) => {
    const existing = await db.quotation.findUnique({ where: { quotationNumber: candidate }, select: { id: true } });
    return existing !== null;
  });

  await db.$transaction(async (tx) => {
    const customer = await getOrCreateCustomer(
      { name: data.guestName, phone: data.guestPhone, email: data.guestEmail },
      tx,
    );

    await tx.quotation.create({
      data: {
        quotationNumber,
        customerId: customer.id,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
        intendedUse: data.intendedUse,
        propertyType: data.propertyType,
        currentPowerSource: data.currentPowerSource,
        installationRequired: data.installationRequired,
        budgetRange: data.budgetRange,
        preferredCompletionDate: data.preferredCompletionDate ? new Date(data.preferredCompletionDate) : undefined,
        customerNotes: data.customerNotes,
        items: {
          create: seededItems.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
      },
    });
  });

  return { success: true, quotationNumber };
}
