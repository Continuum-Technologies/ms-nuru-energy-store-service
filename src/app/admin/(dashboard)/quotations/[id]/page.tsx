import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { getQuotationById, getActiveProductsForLineItems } from "@/modules/quotations/queries";
import { TERMINAL_QUOTATION_STATUSES } from "@/modules/quotations/schemas";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { QuotationRequestDetails } from "./_components/quotation-request-details";
import { QuotationLineItems } from "./_components/quotation-line-items";
import { QuotationCommercials } from "./_components/quotation-commercials";
import { QuotationActions } from "./_components/quotation-actions";

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: Readonly<QuotationDetailPageProps>) {
  await requirePermissionOrRedirect("quotations.view");
  const { id } = await params;

  const [quotation, products] = await Promise.all([getQuotationById(id), getActiveProductsForLineItems()]);
  if (!quotation) notFound();

  const editable = !(TERMINAL_QUOTATION_STATUSES as readonly string[]).includes(quotation.status);
  const customerName = quotation.guestName || quotation.customer?.name || "Customer";
  const customerPhone = quotation.guestPhone || quotation.customer?.phone || null;
  const customerEmail = quotation.guestEmail || quotation.customer?.email || null;

  const isConverted = quotation.status === "CONVERTED_TO_ORDER";
  const isAccepted = quotation.status === "ACCEPTED" || isConverted;
  const isSent = quotation.status === "QUOTATION_SENT" || isAccepted;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/quotations"
            className="flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Quotations Ledger
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight font-mono text-foreground">
              {quotation.quotationNumber}
            </h1>
            <Badge tone={editable ? "info" : isAccepted ? "success" : "neutral"}>
              {quotation.status.replaceAll("_", " ")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/admin/quotations/${quotation.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold" })}
          >
            <Download className="h-3.5 w-3.5" />
            Download / Print PDF
          </a>
        </div>
      </div>

      {/* Lifecycle Workflow Stepper */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-2xl border border-border/80 bg-surface p-3 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 p-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shrink-0">
            1
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Request Received</span>
            <span className="text-[10px] text-neutral-500">Customer Specs</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 p-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${quotation.items.length > 0 ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"}`}>
            2
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Pricing & Terms</span>
            <span className="text-[10px] text-neutral-500">{quotation.items.length} items configured</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 p-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${isSent ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"}`}>
            3
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Quotation Issued</span>
            <span className="text-[10px] text-neutral-500">{isSent ? "Sent to Customer" : "Drafting"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 p-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${isAccepted ? "bg-success-600 text-white" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"}`}>
            4
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Order Conversion</span>
            <span className="text-[10px] text-neutral-500">{quotation.order ? quotation.order.orderNumber : "Pending Deal"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <QuotationRequestDetails
            customerName={customerName}
            customerPhone={customerPhone ?? "—"}
            customerEmail={customerEmail}
            intendedUse={quotation.intendedUse}
            propertyType={quotation.propertyType}
            currentPowerSource={quotation.currentPowerSource}
            installationRequired={quotation.installationRequired}
            budgetRange={quotation.budgetRange}
            preferredCompletionDate={quotation.preferredCompletionDate}
            customerNotes={quotation.customerNotes}
          />

          <QuotationLineItems
            quotationId={quotation.id}
            items={quotation.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              lineTotal: Number(item.lineTotal),
            }))}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              sellingPrice: Number(product.sellingPrice),
            }))}
            editable={editable}
          />

          <QuotationCommercials
            quotationId={quotation.id}
            subtotal={quotation.subtotal ? Number(quotation.subtotal) : null}
            discountTotal={quotation.discountTotal ? Number(quotation.discountTotal) : null}
            installationCharge={quotation.installationCharge ? Number(quotation.installationCharge) : null}
            deliveryCharge={quotation.deliveryCharge ? Number(quotation.deliveryCharge) : null}
            taxTotal={quotation.taxTotal ? Number(quotation.taxTotal) : null}
            total={quotation.total ? Number(quotation.total) : null}
            termsAndConditions={quotation.termsAndConditions}
            paymentTerms={quotation.paymentTerms}
            warrantyInfo={quotation.warrantyInfo}
            expiresAt={quotation.expiresAt}
            editable={editable}
          />
        </div>

        <div className="lg:col-span-1">
          <QuotationActions
            quotationId={quotation.id}
            quotationNumber={quotation.quotationNumber}
            status={quotation.status}
            total={quotation.total ? Number(quotation.total) : null}
            guestPhone={customerPhone}
            editable={editable}
            convertedOrder={quotation.order}
          />
        </div>
      </div>
    </div>
  );
}
