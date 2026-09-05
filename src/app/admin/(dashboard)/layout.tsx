import { redirect } from "next/navigation";
import { getCurrentStaffSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { NAV_ITEMS } from "./_components/nav-items";
import { SidebarNav } from "./_components/sidebar-nav";
import { MobileNav } from "./_components/mobile-nav";
import { UserPanel } from "./_components/user-panel";
import { TopHeader } from "./_components/top-header";
import { getOperationalStats } from "./_lib/operational-stats";

export const dynamic = "force-dynamic";

/**
 * Layout for every authenticated `/admin` page. Redirects to `/admin/login`
 * if there's no valid session — this is the real authorization boundary
 * (`src/proxy.ts` only does a fast optimistic cookie check, per CLAUDE.md §7).
 */
export default async function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentStaffSession();
  if (!session) {
    redirect("/admin/login");
  }

  // cache()-wrapped: if the current page also calls getOperationalStats()
  // (the dashboard page does), this doesn't cost a second round trip.
  const stats = await getOperationalStats();
  const badges = {
    pendingOrders: stats.pendingOrders,
    newQuotations: stats.newQuotations,
    lowStock: stats.lowStock,
  };

  const visibleHrefs = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(session.user.role, item.permission),
  ).map((item) => item.href);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans antialiased">
      <TopHeader user={session.user} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-surface/60 backdrop-blur-xs md:flex h-full">
          <SidebarNav visibleHrefs={visibleHrefs} badges={badges} />
          <UserPanel user={session.user} />
        </aside>

        <div className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-6">
          <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>

      <MobileNav visibleHrefs={visibleHrefs} badges={badges} />
    </div>
  );
}
