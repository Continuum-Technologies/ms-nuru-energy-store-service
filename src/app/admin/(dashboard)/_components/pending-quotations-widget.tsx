import Link from "next/link";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/infrastructure/database/client";
import type { QuotationStatus } from "@/generated/prisma/client";

// Everything not yet resolved one way or the other — a quotation that's been
// accepted/rejected/expired/converted/cancelled no longer needs attention, so
// it shouldn't show up in a "pending" widget.
const PENDING_QUOTATION_STATUSES = [
  "NEW_REQUEST",
  "UNDER_REVIEW",
  "MORE_INFO_REQUIRED",
  "SITE_ASSESSMENT_REQUIRED",
  "PREPARING_QUOTATION",
  "QUOTATION_SENT",
  "CUSTOMER_REVIEWING",
] as const satisfies readonly QuotationStatus[];

function getQuotationTone(status: QuotationStatus): "neutral" | "brand" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "NEW_REQUEST":
    case "MORE_INFO_REQUIRED":
    case "SITE_ASSESSMENT_REQUIRED":
      return "warning";
    case "UNDER_REVIEW":
    case "PREPARING_QUOTATION":
    case "CUSTOMER_REVIEWING":
      return "info";
    case "QUOTATION_SENT":
      return "brand";
    case "ACCEPTED":
    case "CONVERTED_TO_ORDER":
      return "success";
    case "REJECTED":
    case "EXPIRED":
      return "danger";
    case "CANCELLED":
      return "neutral";
  }
}

export async function PendingQuotationsWidget() {
  const recentQuotations = await db.quotation.findMany({
    where: { status: { in: [...PENDING_QUOTATION_STATUSES] } },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quotationNumber: true,
      status: true,
      guestName: true,
      guestPhone: true,
      customer: { select: { name: true, phone: true } },
      createdAt: true,
    },
  });

  return (
    <Card className="flex flex-col border-border/80 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-surface/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-info-600 dark:text-info-400" />
          <CardTitle className="text-base font-bold text-foreground">Pending Quotations</CardTitle>
        </div>
        <Link
          href="/admin/quotations"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {recentQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-neutral-400">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No pending quotation requests</p>
            <p className="mt-1 text-xs text-neutral-500">
              Custom solar equipment quotation requests awaiting action will show here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentQuotations.map((quotation) => {
              const name = quotation.guestName || quotation.customer?.name || "Client";
              const phone = quotation.guestPhone || quotation.customer?.phone || "N/A";

              return (
                <div
                  key={quotation.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {quotation.quotationNumber}
                      </span>
                      <Badge tone={getQuotationTone(quotation.status)} className="text-[10px] font-semibold">
                        {quotation.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-xs text-neutral-500">{name}</span>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {phone}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {new Date(quotation.createdAt).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
