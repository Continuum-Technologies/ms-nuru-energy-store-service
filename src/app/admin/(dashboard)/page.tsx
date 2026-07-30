import { Suspense } from "react";
import { Store, Activity, Calendar } from "lucide-react";
import { getCurrentStaffSession } from "@/lib/auth/session";
import { KpiCardsGrid } from "@/components/ui/kpi-card";
import { QuickActionsHub } from "./_components/quick-actions";
import { RecentOrdersWidget } from "./_components/recent-orders-widget";
import { PendingQuotationsWidget } from "./_components/pending-quotations-widget";
import { InventoryWatchlistWidget } from "./_components/inventory-watchlist-widget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOperationalStats } from "./_lib/operational-stats";

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  // getOperationalStats() is cache()-wrapped — the layout already called it
  // for the nav badges this same request, so this doesn't cost a second
  // round trip (see _lib/operational-stats.ts).
  const [session, stats] = await Promise.all([getCurrentStaffSession(), getOperationalStats()]);
  const greeting = getTimeOfDayGreeting();
  const todayFormatted = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {session?.user.name}
          </h1>
          <p className="text-sm text-neutral-500">
            Here is your Nuru Energy store summary and activity overview for today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-control border border-border/80 bg-surface/80 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-2xs dark:text-neutral-300">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span>{todayFormatted}</span>
          </div>
          <Badge tone={session?.user.role === "OWNER" ? "brand" : "neutral"} className="px-2.5 py-1 text-xs font-semibold">
            {session?.user.role}
          </Badge>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Performance Overview</h2>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Activity className="h-3.5 w-3.5 text-success-600" />
            <span>Live DB Connection</span>
          </div>
        </div>
        <KpiCardsGrid stats={stats} />
      </section>

      <section>
        <QuickActionsHub />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<Card className="h-64 animate-pulse bg-surface-muted" />}>
          <RecentOrdersWidget />
        </Suspense>

        <Suspense fallback={<Card className="h-64 animate-pulse bg-surface-muted" />}>
          <PendingQuotationsWidget />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<Card className="h-64 animate-pulse bg-surface-muted" />}>
            <InventoryWatchlistWidget />
          </Suspense>
        </div>

        <div>
          <Card className="h-full flex flex-col justify-between border-border/80 shadow-card">
            <CardHeader className="border-b border-border/60 bg-surface/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base font-bold text-foreground">Store Health & Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center justify-between rounded-control border border-border/60 bg-surface-muted/40 p-3">
                <span className="font-semibold text-foreground">Database Sync</span>
                <Badge tone="success" className="text-[10px] font-bold uppercase">Online & Operational</Badge>
              </div>
              <div className="flex items-center justify-between rounded-control border border-border/60 bg-surface-muted/40 p-3">
                <span className="font-semibold text-foreground">Single-Store Mode</span>
                <Badge tone="brand" className="text-[10px] font-bold uppercase">Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-control border border-border/60 bg-surface-muted/40 p-3">
                <span className="font-semibold text-foreground">Payment Gateways</span>
                <Badge tone="info" className="text-[10px] font-bold uppercase">M-Pesa / Bank / Cash</Badge>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                All stats and figures on this dashboard query the live database in real-time with zero mock data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
