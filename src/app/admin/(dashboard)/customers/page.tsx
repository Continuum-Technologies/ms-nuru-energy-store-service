import Link from "next/link";
import { Users, Building2, Sprout, UserCheck, ArrowUpRight, Mail, Phone, MapPin, FileText, ShoppingBag } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getCustomersList, getCustomerStats } from "@/modules/customers/queries";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKes } from "@/lib/currency";
import type { CustomerType } from "@/generated/prisma/client";

const CUSTOMER_TYPE_TONE: Record<CustomerType, "brand" | "success" | "warning" | "danger" | "info" | "neutral"> = {
  INDIVIDUAL: "neutral",
  BUSINESS: "brand",
  FARMER: "success",
  CONTRACTOR: "info",
  INSTITUTION: "warning",
  RESELLER: "brand",
};

const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  INDIVIDUAL: "Individual / Home",
  BUSINESS: "Business Enterprise",
  FARMER: "Agri / Farmer",
  CONTRACTOR: "EPRA Contractor",
  INSTITUTION: "Institution / NGO",
  RESELLER: "Hardware Reseller",
};

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  customerType: CustomerType;
  location: string;
  orderCount: number;
  quotationCount: number;
  lifetimeSpend: number;
  createdAt: Date;
}

interface CustomersPageProps {
  searchParams?: Promise<{ page?: string; q?: string }>;
}

export default async function CustomersPage({ searchParams }: Readonly<CustomersPageProps>) {
  await requirePermissionOrRedirect("customers.view");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

  const [customers, stats] = await Promise.all([getCustomersList(), getCustomerStats()]);

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    customerType: c.customerType,
    location: [c.county, c.town].filter(Boolean).join(", ") || "—",
    orderCount: c.orderCount,
    quotationCount: c.quotationCount,
    lifetimeSpend: c.lifetimeSpend,
    createdAt: c.createdAt,
  }));

  const columns: DataListColumn<CustomerRow>[] = [
    {
      key: "name",
      header: "Customer & Classification",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Link
            href={`/admin/customers/${row.id}`}
            className="font-bold text-sm text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {row.name}
          </Link>
          <div className="flex items-center gap-1.5">
            <Badge tone={CUSTOMER_TYPE_TONE[row.customerType]}>
              {CUSTOMER_TYPE_LABEL[row.customerType]}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Details",
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <a href={`tel:${row.phone}`} className="font-bold text-foreground hover:text-brand-600 hover:underline flex items-center gap-1">
            <Phone className="h-3 w-3 text-neutral-400" />
            {row.phone}
          </a>
          {row.email ? (
            <a href={`mailto:${row.email}`} className="text-neutral-500 hover:underline flex items-center gap-1">
              <Mail className="h-3 w-3 text-neutral-400" />
              {row.email}
            </a>
          ) : (
            <span className="text-neutral-400 italic">No email linked</span>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Primary Region",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-neutral-400" />
          {row.location}
        </span>
      ),
    },
    {
      key: "quotations",
      header: "Quotations",
      hideOnMobile: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <FileText className="h-3 w-3 text-neutral-400" />
          {row.quotationCount} {row.quotationCount === 1 ? "Quote" : "Quotes"}
        </span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      hideOnMobile: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <ShoppingBag className="h-3 w-3 text-neutral-400" />
          {row.orderCount} {row.orderCount === 1 ? "Order" : "Orders"}
        </span>
      ),
    },
    {
      key: "spend",
      header: "Lifetime Value",
      render: (row) => (
        <span className="font-mono text-sm font-extrabold text-brand-600 dark:text-brand-400">
          {formatKes(row.lifetimeSpend)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Registered",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-xs text-neutral-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/admin/customers/${row.id}`}
          className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-surface px-2 py-1 text-xs font-bold text-neutral-600 hover:border-brand-500/40 hover:bg-brand-50/40 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-brand-600/10 dark:hover:text-brand-400 transition-colors"
        >
          View Profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Customer Directory</h1>
          <p className="text-xs text-neutral-500">
            View registered customer accounts, commercial classifications, quotation requests, and lifetime spend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-brand-500/20 bg-brand-50/40 dark:bg-brand-600/10 px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">Total Customer Revenue:</span>
            <span className="font-mono text-sm font-black text-brand-600 dark:text-brand-400">
              {formatKes(stats.totalLifetimeRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Customers"
          value={stats.totalCount}
          subtitle={`${formatKes(stats.totalLifetimeRevenue)} spend`}
          icon={<Users className="h-4 w-4" />}
          tone="brand"
        />
        <KpiCard
          title="Business / Enterprise"
          value={stats.businessCount}
          subtitle="Commercial & Contractors"
          icon={<Building2 className="h-4 w-4" />}
          tone="info"
        />
        <KpiCard
          title="Agri & Farmers"
          value={stats.farmerCount}
          subtitle="Solar Irrigation & Pumps"
          icon={<Sprout className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          title="Individual / Home"
          value={stats.individualCount}
          subtitle="Residential Solar Backup"
          icon={<UserCheck className="h-4 w-4" />}
          tone="warning"
        />
      </div>

      {/* Main Data Directory */}
      <DataList
        page={page}
        searchParams={resolvedSearchParams}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={CUSTOMER_TYPE_TONE[row.customerType]}>{CUSTOMER_TYPE_LABEL[row.customerType]}</Badge>}
        emptyState={
          <EmptyState
            title="No customers found"
            description="Customer profiles will be created automatically when customers place orders or submit quotation requests."
            action={<Users className="h-5 w-5 text-neutral-400" />}
          />
        }
      />
    </div>
  );
}
