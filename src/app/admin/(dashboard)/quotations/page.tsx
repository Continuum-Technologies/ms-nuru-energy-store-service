import Link from "next/link";
import { FileText, AlertCircle, Clock, CheckCircle2, Wrench, ChevronRight } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getQuotationsList, getQuotationStats } from "@/modules/quotations/queries";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { buttonVariants } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import type { QuotationStatus } from "@/generated/prisma/client";

const STATUS_TONE: Record<QuotationStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  NEW_REQUEST: "warning",
  UNDER_REVIEW: "info",
  MORE_INFO_REQUIRED: "warning",
  SITE_ASSESSMENT_REQUIRED: "warning",
  PREPARING_QUOTATION: "info",
  QUOTATION_SENT: "brand",
  CUSTOMER_REVIEWING: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
  CONVERTED_TO_ORDER: "success",
  CANCELLED: "neutral",
};

interface QuotationRow {
  id: string;
  quotationNumber: string;
  status: QuotationStatus;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  installationRequired: boolean;
  itemCount: number;
  total: number | null;
  createdAt: Date;
}

interface QuotationsPageProps {
  searchParams?: Promise<{ page?: string; q?: string }>;
}

export default async function QuotationsPage({ searchParams }: Readonly<QuotationsPageProps>) {
  await requirePermissionOrRedirect("quotations.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

  const [quotations, stats] = await Promise.all([
    getQuotationsList(),
    getQuotationStats(),
  ]);

  const rows: QuotationRow[] = quotations.map((quotation) => ({
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    status: quotation.status,
    customerName: quotation.guestName || quotation.customer?.name || "Customer",
    customerPhone: quotation.guestPhone || quotation.customer?.phone || null,
    customerEmail: quotation.guestEmail || quotation.customer?.email || null,
    installationRequired: quotation.installationRequired,
    itemCount: quotation._count.items,
    total: quotation.total ? Number(quotation.total) : null,
    createdAt: quotation.createdAt,
  }));

  const columns: DataListColumn<QuotationRow>[] = [
    {
      key: "number",
      header: "Quotation Ref",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/admin/quotations/${row.id}`}
            className="font-bold text-foreground hover:text-brand-600 font-mono text-xs flex items-center gap-1.5"
          >
            {row.quotationNumber}
          </Link>
          <span className="text-[11px] font-medium text-neutral-500">
            {row.itemCount} {row.itemCount === 1 ? "item" : "items"} requested
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer Contact",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-xs">{row.customerName}</span>
          <span className="text-[11px] text-neutral-500">
            {row.customerPhone ?? row.customerEmail ?? "No contact details"}
          </span>
        </div>
      ),
    },
    {
      key: "installation",
      header: "Installation",
      hideOnMobile: true,
      render: (row) =>
        row.installationRequired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/80 dark:bg-brand-600/15 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
            <Wrench className="h-3 w-3" /> Required
          </span>
        ) : (
          <span className="text-[11px] text-neutral-400">Supply Only</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status]}>
          {row.status.replaceAll("_", " ")}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Quotation Value",
      render: (row) =>
        row.total !== null ? (
          <span className="font-bold text-foreground text-xs">{formatKes(row.total)}</span>
        ) : (
          <span className="text-xs text-neutral-400 italic">Pending Pricing</span>
        ),
    },
    {
      key: "date",
      header: "Requested On",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs text-neutral-500">
          {new Date(row.createdAt).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/admin/quotations/${row.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1 text-xs font-bold" })}
          >
            Review
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quotations Ledger</h1>
          <p className="text-sm text-neutral-500">
            Review customer quote requests, prepare engineering estimates, and track order conversions.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total Requests"
          value={stats.total}
          subtitle="All Time"
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="brand"
        />
        <KpiCard
          title="New Requests"
          value={stats.newRequests}
          subtitle={stats.newRequests > 0 ? "Requires Review" : "Up to date"}
          icon={<AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="warning"
        />
        <KpiCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Reviewing / Drafted"
          icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="info"
        />
        <KpiCard
          title="Converted / Accepted"
          value={stats.converted}
          subtitle="Closed Deals"
          icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="success"
        />
      </div>

      {/* Main Quotations Data List */}
      <DataList
        page={page}
        searchParams={resolvedSearchParams}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.quotationNumber}
        mobileAccessory={(row) => <Badge tone={STATUS_TONE[row.status]}>{row.status.replaceAll("_", " ")}</Badge>}
        emptyState={
          <EmptyState
            title="No quotation requests found"
            description="Requests submitted from equipment product pages, the cart, or the quote form will appear here."
            action={<FileText className="h-5 w-5 text-neutral-400" />}
          />
        }
      />
    </div>
  );
}
