"use server";

import { redirect } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { convertQuotationSchema } from "./schemas";
import { generateOrderNumber } from "./order-number";
import { reserveStock } from "@/modules/inventory/reserve-stock";

type FormState = { error: string } | undefined;

/**
 * Converts an ACCEPTED quotation into a real `Order` — through the orders
 * module's own API, never by the quotations module writing `Order` rows
 * directly (the module-boundary rule already noted on `Quotation.order` in
 * the schema). A quotation carries no delivery address of its own (it's a
 * pre-sale pricing artifact, not a delivery plan), so staff supply it here,
 * at the moment of conversion. Payment defaults to `MANUAL` — this order
 * comes out of a negotiated, staff-mediated process, not a customer-picked
 * checkout method.
 */
export async function convertQuotationToOrder(
  quotationId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("quotations.convert");

  const parsed = convertQuotationSchema.safeParse({
    county: formData.get("county"),
    town: formData.get("town"),
    deliveryLocation: formData.get("deliveryLocation") || undefined,
    deliveryInstructions: formData.get("deliveryInstructions") || undefined,
    paymentMethod: formData.get("paymentMethod"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the delivery details and try again." };
  }
  const data = parsed.data;

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    include: { items: true },
  });

  if (!quotation) {
    return { error: "Quotation not found." };
  }
  if (quotation.status !== "ACCEPTED") {
    return { error: "Only an accepted quotation can be converted into an order." };
  }
  if (quotation.items.length === 0 || quotation.total === null) {
    return { error: "This quotation has no priced line items yet — finish pricing it before converting." };
  }

  const orderNumber = await generateOrderNumber(async (candidate) => {
    const existing = await db.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    return existing !== null;
  });

  // Snapshot the real SKU for line items tied to a catalog product — a
  // QuotationItem only stores productId, not sku, so the current product
  // row is the source of truth at conversion time. Custom (non-catalog)
  // line items have no SKU to snapshot.
  const productIds = quotation.items.map((item) => item.productId).filter((id): id is string => id !== null);
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, sku: true } });
  const skuByProductId = new Map(products.map((product) => [product.id, product.sku]));

  await db.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId: quotation.customerId,
        guestName: quotation.guestName,
        guestPhone: quotation.guestPhone,
        guestEmail: quotation.guestEmail,
        county: data.county,
        town: data.town,
        deliveryLocation: data.deliveryLocation,
        deliveryInstructions: data.deliveryInstructions,
        customerNotes: quotation.customerNotes,
        quotationId: quotation.id,
        subtotal: quotation.subtotal ?? 0,
        discountTotal: quotation.discountTotal ?? 0,
        installationCharge: quotation.installationCharge ?? 0,
        deliveryCharge: quotation.deliveryCharge ?? 0,
        taxTotal: quotation.taxTotal ?? 0,
        total: quotation.total ?? 0,
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            productName: item.description,
            productSku: (item.productId && skuByProductId.get(item.productId)) || "N/A",
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: createdOrder.id, toStatus: "NEW" },
    });

    await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        reference: `${orderNumber}-P1`,
        method: data.paymentMethod,
        amount: quotation.total ?? 0,
        status: "PENDING",
      },
    });

    // Only items tied to a real catalog product have stock to reserve —
    // custom line items (productId null) have nothing to check against.
    await reserveStock(
      tx,
      createdOrder.id,
      quotation.items.filter((item) => item.productId).map((item) => ({ productId: item.productId!, quantity: item.quantity })),
    );

    await tx.quotation.update({ where: { id: quotationId }, data: { status: "CONVERTED_TO_ORDER" } });
  });

  redirect(`/admin/quotations/${quotationId}`);
}
