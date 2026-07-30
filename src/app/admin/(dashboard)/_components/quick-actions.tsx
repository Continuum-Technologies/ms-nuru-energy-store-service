import Link from "next/link";
import { PlusCircle, FilePlus2, ShoppingBag, Boxes, UserCog, Settings, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function QuickActionsHub() {
  const actions = [
    {
      label: "Add Product",
      desc: "New solar, inverter or battery item",
      href: "/admin/products/new",
      icon: PlusCircle,
      color: "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-200",
    },
    {
      label: "Create Quotation",
      desc: "Prepare custom customer quote",
      href: "/admin/quotations",
      icon: FilePlus2,
      color: "bg-info-50 text-info-700 dark:bg-info-600/15 dark:text-info-200",
    },
    {
      label: "Review Orders",
      desc: "Process incoming store purchases",
      href: "/admin/orders",
      icon: ShoppingBag,
      color: "bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-200",
    },
    {
      label: "Receive Stock",
      desc: "Log inventory arrival or adjustments",
      href: "/admin/inventory",
      icon: Boxes,
      color: "bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-200",
    },
    {
      label: "Staff & Permissions",
      desc: "Manage team roles & access",
      href: "/admin/staff",
      icon: UserCog,
      color: "bg-surface-muted text-foreground",
    },
    {
      label: "Store Settings",
      desc: "Payment methods & store details",
      href: "/admin/settings",
      icon: Settings,
      color: "bg-surface-muted text-foreground",
    },
  ];

  return (
    <Card className="overflow-hidden border-border/80 shadow-card">
      <CardHeader className="border-b border-border/60 bg-surface/40 px-5 py-4">
        <CardTitle className="text-base font-bold text-foreground">Quick Action Hub</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center justify-between rounded-control border border-border/70 bg-surface/80 p-3.5 transition-all duration-200 hover:border-brand-500/40 hover:bg-surface-muted hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {action.label}
                    </span>
                    <span className="text-xs text-neutral-500">{action.desc}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
