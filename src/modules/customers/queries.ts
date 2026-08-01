import { db } from "@/infrastructure/database/client";

/** Admin KPI metrics for Customer Directory. */
export async function getCustomerStats() {
  const [totalCount, businessCount, farmerCount, individualCount, ordersAgg] = await Promise.all([
    db.customer.count(),
    db.customer.count({
      where: { customerType: { in: ["BUSINESS", "CONTRACTOR", "INSTITUTION", "RESELLER"] } },
    }),
    db.customer.count({ where: { customerType: "FARMER" } }),
    db.customer.count({ where: { customerType: "INDIVIDUAL" } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { customerId: { not: null }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    }),
  ]);

  return {
    totalCount,
    businessCount,
    farmerCount,
    individualCount,
    totalLifetimeRevenue: Number(ordersAgg._sum.total ?? 0),
  };
}

/** Admin list page — customer directory with order and quotation counts and lifetime spend. */
export async function getCustomersList() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          orders: true,
          quotations: true,
          addresses: true,
        },
      },
      orders: {
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        select: { total: true },
      },
    },
  });

  return customers.map((c) => {
    const lifetimeSpend = c.orders.reduce((acc, curr) => acc + Number(curr.total), 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      customerType: c.customerType,
      county: c.county,
      town: c.town,
      notes: c.notes,
      orderCount: c._count.orders,
      quotationCount: c._count.quotations,
      addressCount: c._count.addresses,
      lifetimeSpend,
      createdAt: c.createdAt,
    };
  });
}

/** Full details for customer detail view. */
export async function getCustomerById(id: string) {
  return db.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: { select: { id: true } },
        },
      },
      quotations: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quotationNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
    },
  });
}
