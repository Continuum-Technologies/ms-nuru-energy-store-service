import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getStaffList, getStaffStats, getRecentAuditLogs } from "@/modules/staff/queries";
import { requireStaffSession } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { Users, ShoppingBag, Package, ShieldAlert, History } from "lucide-react";
import { AddStaffDialog } from "./_components/add-staff-dialog";
import { StaffRowActions } from "./_components/staff-row-actions";
import { StaffRole } from "@/generated/prisma/client";

const ROLE_TONE: Record<StaffRole, "brand" | "success" | "warning" | "danger" | "info" | "neutral"> = {
  OWNER: "brand",
  ADMINISTRATOR: "info",
  SALES: "success",
  INVENTORY: "warning",
  CONTENT: "neutral",
};

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: "Owner (Full Access)",
  ADMINISTRATOR: "Administrator",
  SALES: "Sales Officer",
  INVENTORY: "Inventory Manager",
  CONTENT: "Content Editor",
};

interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  isLocked: boolean;
  failedAttempts: number;
  assignedOrders: number;
  preparedQuotations: number;
  activeSessions: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  isSelf: boolean;
}

export default async function StaffPage() {
  await requirePermissionOrRedirect("staff.manage");
  const { user: currentActor } = await requireStaffSession();

  const [staffList, stats, auditLogs] = await Promise.all([
    getStaffList(),
    getStaffStats(),
    getRecentAuditLogs(),
  ]);

  const rows: StaffRow[] = staffList.map((s) => {
    const isLocked = Boolean(s.lockedUntil && s.lockedUntil > new Date());
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      isActive: s.isActive,
      isLocked,
      failedAttempts: s.failedLoginAttempts,
      assignedOrders: s._count.assignedOrders,
      preparedQuotations: s._count.preparedQuotations,
      activeSessions: s._count.sessions,
      lastLoginAt: s.lastLoginAt,
      createdAt: s.createdAt,
      isSelf: s.id === currentActor.id,
    };
  });

  const columns: DataListColumn<StaffRow>[] = [
    {
      key: "name",
      header: "Staff Member",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground">{row.name}</span>
            {row.isSelf && (
              <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                You
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role & Scope",
      render: (row) => <Badge tone={ROLE_TONE[row.role]}>{ROLE_LABEL[row.role]}</Badge>,
    },
    {
      key: "status",
      header: "Account Status",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {row.isLocked ? (
            <Badge tone="warning">Locked ({row.failedAttempts} fails)</Badge>
          ) : row.isActive ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge tone="danger">Deactivated</Badge>
          )}
          {row.activeSessions > 0 && (
            <span className="text-[10px] text-neutral-400 font-medium">{row.activeSessions} active session(s)</span>
          )}
        </div>
      ),
    },
    {
      key: "activity",
      header: "Assigned Work",
      hideOnMobile: true,
      render: (row) => (
        <div className="flex flex-col text-xs text-neutral-600 dark:text-neutral-300 font-medium">
          <span>{row.assignedOrders} Orders assigned</span>
          <span className="text-[11px] text-neutral-400">{row.preparedQuotations} Quotes prepared</span>
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs text-neutral-500 font-medium">
          {row.lastLoginAt
            ? new Date(row.lastLoginAt).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
            : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <StaffRowActions
          staffId={row.id}
          name={row.name}
          email={row.email}
          role={row.role}
          isActive={row.isActive}
          isLocked={row.isLocked}
          isSelf={row.isSelf}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Staff & Role Permissions</h1>
          <p className="text-xs text-neutral-500">
            Manage team member accounts, RBAC permissions, account lockouts, and system audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddStaffDialog />
        </div>
      </div>

      {/* KPI Performance Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Team Members"
          value={stats.totalCount}
          subtitle={`${stats.activeCount} Active accounts`}
          icon={<Users className="h-4 w-4" />}
          tone="brand"
        />
        <KpiCard
          title="Sales Officers"
          value={stats.roleCounts[StaffRole.SALES] ?? 0}
          subtitle="Quotations & Deals"
          icon={<ShoppingBag className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          title="Inventory Officers"
          value={stats.roleCounts[StaffRole.INVENTORY] ?? 0}
          subtitle="Stock & Products"
          icon={<Package className="h-4 w-4" />}
          tone="info"
        />
        <KpiCard
          title="Security & Lockouts"
          value={stats.lockedCount}
          subtitle={stats.lockedCount > 0 ? "Requires Review" : "All Accounts Clean"}
          icon={<ShieldAlert className="h-4 w-4" />}
          tone={stats.lockedCount > 0 ? "warning" : "brand"}
        />
      </div>

      {/* Staff Directory Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-foreground">Active Staff Roster</h2>
        <DataList
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          mobileTitle={(row) => row.name}
          mobileAccessory={(row) => <Badge tone={ROLE_TONE[row.role]}>{ROLE_LABEL[row.role]}</Badge>}
        />
      </div>

      {/* System Audit Trail Section */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base font-extrabold">Recent System Audit Trail</CardTitle>
            </div>
            <span className="text-xs font-semibold text-neutral-500">Append-Only Event Log</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No audit trail events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-surface-muted/50 font-bold uppercase tracking-wider text-neutral-500">
                    <th className="py-2.5 px-3">Actor / User</th>
                    <th className="py-2.5 px-3">Event Action</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {log.actor ? log.actor.name : "System Automation"}
                          </span>
                          {log.actor && (
                            <span className="text-[10px] text-neutral-400">{log.actor.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300 font-medium">
                        {log.entityType}
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-400 font-mono">
                        {new Date(log.createdAt).toLocaleString("en-KE", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
