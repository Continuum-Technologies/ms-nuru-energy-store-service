import { db } from "@/infrastructure/database/client";

/** Admin list page — every quotation regardless of status (unlike the storefront's published-only catalog queries, this is a staff-only view). */
export async function getQuotationsList() {
  return db.quotation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quotationNumber: true,
      status: true,
      guestName: true,
      guestPhone: true,
      guestEmail: true,
      installationRequired: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
      customer: { select: { name: true, phone: true, email: true } },
    },
  });
}

export async function getQuotationStats() {
  const [total, newRequests, inProgress, converted] = await Promise.all([
    db.quotation.count(),
    db.quotation.count({ where: { status: "NEW_REQUEST" } }),
    db.quotation.count({
      where: {
        status: {
          in: [
            "UNDER_REVIEW",
            "PREPARING_QUOTATION",
            "MORE_INFO_REQUIRED",
            "SITE_ASSESSMENT_REQUIRED",
            "CUSTOMER_REVIEWING",
            "QUOTATION_SENT",
          ],
        },
      },
    }),
    db.quotation.count({
      where: {
        status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] },
      },
    }),
  ]);

  return { total, newRequests, inProgress, converted };
}

/** Full detail for the admin builder page and PDF generation. */
export async function getQuotationById(id: string) {
  return db.quotation.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      items: { orderBy: { id: "asc" } },
      preparedBy: { select: { name: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });
}

/** ACTIVE products for the admin line-item product picker — a plain select, not a search combobox (the catalog is small). */
export async function getActiveProductsForLineItems() {
  return db.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, sku: true, sellingPrice: true },
    orderBy: { name: "asc" },
  });
}
