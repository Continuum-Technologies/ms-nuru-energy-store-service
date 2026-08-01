import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, ShoppingBag, ArrowUpRight } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getCustomerById } from "@/modules/customers/queries";
import { getOrderStatusTone } from "@/modules/orders/status-tone";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Readonly<CustomerDetailPageProps>) {
  await requirePermissionOrRedirect("customers.view");
  const { id } = await params;

  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const totalLifetimeSpend = customer.orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((acc, curr) => acc + Number(curr.total), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/customers"
            className="flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Customer Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{customer.name}</h1>
            <Badge tone={CUSTOMER_TYPE_TONE[customer.customerType]}>
              {CUSTOMER_TYPE_LABEL[customer.customerType]}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-brand-500/20 bg-brand-50/40 dark:bg-brand-600/10 px-3.5 py-1.5 flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">Lifetime Account Spend:</span>
            <span className="font-mono text-base font-black text-brand-600 dark:text-brand-400">
              {formatKes(totalLifetimeSpend)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Performance Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-surface p-4 flex flex-col gap-1 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Lifetime Spend</span>
          <span className="font-mono text-xl font-black text-brand-600 dark:text-brand-400">{formatKes(totalLifetimeSpend)}</span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-4 flex flex-col gap-1 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Total Orders</span>
          <span className="text-xl font-black text-foreground">{customer.orders.length}</span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-4 flex flex-col gap-1 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Quotation Requests</span>
          <span className="text-xl font-black text-foreground">{customer.quotations.length}</span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-4 flex flex-col gap-1 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Delivery Locations</span>
          <span className="text-xl font-black text-foreground">{customer.addresses.length}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Contact Profile & Saved Addresses */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base font-extrabold">Contact & Account Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
                <Phone className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Number</span>
                  <a href={`tel:${customer.phone}`} className="font-bold text-foreground hover:text-brand-600 hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
                <Mail className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</span>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="font-bold text-foreground hover:text-brand-600 hover:underline">
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-neutral-400 italic">No email linked</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
                <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Primary Region</span>
                  <span className="font-bold text-foreground">
                    {[customer.county, customer.town].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
              </div>

              {customer.notes && (
                <div className="flex flex-col gap-1 rounded-xl border border-brand-500/20 bg-brand-50/20 p-3 dark:bg-brand-600/10">
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-[10px] uppercase tracking-wider">Account Notes:</span>
                  <p className="text-foreground italic">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <CardTitle className="text-base font-extrabold">Delivery Destinations</CardTitle>
                </div>
                <span className="text-xs font-semibold text-neutral-500">{customer.addresses.length} Saved</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-4 text-xs">
              {customer.addresses.length === 0 ? (
                <p className="text-neutral-400 italic">No saved delivery addresses recorded yet.</p>
              ) : (
                customer.addresses.map((addr) => (
                  <div key={addr.id} className="flex flex-col gap-1 rounded-xl border border-border/70 bg-surface-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {addr.county}, {addr.town}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                          Default
                        </span>
                      )}
                    </div>
                    {addr.deliveryLocation && <span className="text-neutral-500">{addr.deliveryLocation}</span>}
                    {addr.deliveryInstructions && (
                      <span className="text-[11px] text-neutral-400 italic">Notes: {addr.deliveryInstructions}</span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quotations and Orders Ledger */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Order History */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-brand-600" />
                  <CardTitle className="text-base font-extrabold">Order History Ledger</CardTitle>
                </div>
                <span className="text-xs font-semibold text-neutral-500">{customer.orders.length} Total Orders</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {customer.orders.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No purchase orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-surface-muted/50 font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-3">Order Ref</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Items</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {customer.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-3 px-3">
                            <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-foreground hover:text-brand-600">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-3">
                            <Badge tone={getOrderStatusTone(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
                          </td>
                          <td className="py-3 px-3 text-center font-medium text-neutral-500">
                            {order.items.length}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-foreground">
                            {formatKes(Number(order.total))}
                          </td>
                          <td className="py-3 px-3 text-right text-neutral-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                            >
                              View <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotations History */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-600" />
                  <CardTitle className="text-base font-extrabold">Quotation Request History</CardTitle>
                </div>
                <span className="text-xs font-semibold text-neutral-500">{customer.quotations.length} Requests</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {customer.quotations.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No quotation requests submitted yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-surface-muted/50 font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-3">Quotation Ref</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {customer.quotations.map((quo) => (
                        <tr key={quo.id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-3 px-3">
                            <Link href={`/admin/quotations/${quo.id}`} className="font-mono font-bold text-foreground hover:text-brand-600">
                              {quo.quotationNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-3">
                            <Badge tone={quo.status === "ACCEPTED" || quo.status === "CONVERTED_TO_ORDER" ? "success" : "info"}>
                              {quo.status.replaceAll("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-foreground">
                            {quo.total ? formatKes(Number(quo.total)) : "—"}
                          </td>
                          <td className="py-3 px-3 text-right text-neutral-500 font-medium">
                            {new Date(quo.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/quotations/${quo.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                            >
                              View <ArrowUpRight className="h-3 w-3" />
                            </Link>
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
      </div>
    </div>
  );
}
