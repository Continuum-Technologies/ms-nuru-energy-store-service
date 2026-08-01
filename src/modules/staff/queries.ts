import { db } from "@/infrastructure/database/client";

/** Admin KPI metrics for Staff Management. */
export async function getStaffStats() {
  const [totalCount, activeCount, lockedCount, roleCounts] = await Promise.all([
    db.adminUser.count(),
    db.adminUser.count({ where: { isActive: true } }),
    db.adminUser.count({
      where: {
        OR: [
          { isActive: false },
          { lockedUntil: { gt: new Date() } },
        ],
      },
    }),
    db.adminUser.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  return {
    totalCount,
    activeCount,
    lockedCount,
    roleCounts: Object.fromEntries(roleCounts.map((r) => [r.role, r._count.role])),
  };
}

/** Admin staff directory with role, status, sessions, and activity counts. */
export async function getStaffList() {
  return db.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          sessions: true,
          auditLogs: true,
          assignedOrders: true,
          preparedQuotations: true,
        },
      },
    },
  });
}

/** Recent system audit logs for audit trail inspection. */
export async function getRecentAuditLogs() {
  return db.auditLog.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
  });
}
