import { History, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByName: string | null;
  createdAt: Date;
}

/** Visual audit trail vertical timeline for status transitions. */
export function OrderStatusHistory({ entries }: Readonly<{ entries: OrderStatusHistoryEntry[] }>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Audit Trail & Status History</CardTitle>
          </div>
          <span className="text-xs font-semibold text-neutral-500">{entries.length} Events</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
          {entries.map((entry, index) => {
            const isLatest = index === 0;
            return (
              <div key={entry.id} className="relative flex items-start justify-between gap-3 text-xs">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-surface ${
                    isLatest
                      ? "border-brand-600 text-brand-600 dark:border-brand-400"
                      : "border-neutral-300 text-neutral-400 dark:border-neutral-700"
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${isLatest ? "bg-brand-600 dark:bg-brand-400" : "bg-neutral-400"}`} />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-bold text-foreground">
                    {entry.fromStatus ? (
                      <span className="text-neutral-500 font-normal">
                        {entry.fromStatus.replaceAll("_", " ")} →{" "}
                      </span>
                    ) : null}
                    <span className={isLatest ? "text-brand-600 dark:text-brand-400 font-extrabold" : ""}>
                      {entry.toStatus.replaceAll("_", " ")}
                    </span>
                  </span>

                  <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-neutral-400" />
                    {entry.changedByName ?? "System Automation"}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                  {new Date(entry.createdAt).toLocaleString("en-KE", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
