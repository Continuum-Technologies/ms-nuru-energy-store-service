"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, MessageCircle, ArrowRightLeft, Settings2, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { updateQuotationStatus } from "@/modules/quotations/admin-actions";
import { QUOTATION_STATUSES } from "@/modules/quotations/schemas";
import { convertQuotationToOrder } from "@/modules/orders/convert-quotation";
import { ALL_PAYMENT_METHODS } from "@/modules/orders/schemas";

const PAYMENT_METHOD_LABELS: Record<(typeof ALL_PAYMENT_METHODS)[number], string> = {
  MPESA_STK_PUSH: "M-Pesa Express (STK Push)",
  MPESA_TILL: "M-Pesa Till",
  MPESA_PAYBILL: "M-Pesa Paybill",
  BANK_TRANSFER: "Bank Transfer",
  CASH_ON_DELIVERY: "Cash on Delivery",
  PAYMENT_ON_COLLECTION: "Payment on Collection",
  MANUAL: "Manual / Already Arranged",
};

export interface QuotationActionsProps {
  quotationId: string;
  quotationNumber: string;
  status: string;
  total: number | null;
  guestPhone: string | null;
  editable: boolean;
  convertedOrder: { orderNumber: string } | null;
}

export function QuotationActions({
  quotationId,
  quotationNumber,
  status,
  total,
  guestPhone,
  editable,
  convertedOrder,
}: Readonly<QuotationActionsProps>) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [justSavedStatus, setJustSavedStatus] = useState(false);

  const [statusState, statusFormAction, statusPending] = useActionState(
    updateQuotationStatus.bind(null, quotationId),
    undefined,
  );
  const [convertState, convertFormAction, convertPending] = useActionState(
    convertQuotationToOrder.bind(null, quotationId),
    undefined,
  );

  const prevStatusPending = useRef(false);
  const prevConvertPending = useRef(false);

  // Instantly revalidate server components on status update
  useEffect(() => {
    if (prevStatusPending.current && !statusPending && !statusState?.error) {
      setJustSavedStatus(true);
      router.refresh();
      const timer = setTimeout(() => setJustSavedStatus(false), 3000);
      return () => clearTimeout(timer);
    }
    prevStatusPending.current = statusPending;
  }, [statusPending, statusState, router]);

  // Instantly revalidate on order conversion
  useEffect(() => {
    if (prevConvertPending.current && !convertPending && !convertState?.error) {
      router.refresh();
    }
    prevConvertPending.current = convertPending;
  }, [convertPending, convertState, router]);

  const [prevServerStatus, setPrevServerStatus] = useState(status);
  if (prevServerStatus !== status) {
    setPrevServerStatus(status);
    setSelectedStatus(status);
  }

  const whatsappHref = guestPhone
    ? `https://wa.me/${guestPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi! Here is your quotation ${quotationNumber} from Nuru Energy${total !== null ? ` — total ${formatKes(total)}` : ""
      }. We'll send the PDF separately.`,
    )}`
    : null;

  let convertContent: React.ReactNode;
  if (convertedOrder) {
    convertContent = (
      <div className="rounded-xl border border-success-500/30 bg-success-50/20 p-3.5 dark:bg-success-600/10 text-xs flex flex-col gap-1">
        <span className="font-bold text-success-800 dark:text-success-300">Deal Converted!</span>
        <p className="text-foreground">
          Converted to active sales order <span className="font-mono font-bold">{convertedOrder.orderNumber}</span>.
        </p>
      </div>
    );
  } else if (selectedStatus !== "ACCEPTED") {
    convertContent = (
      <div className="rounded-xl border border-neutral-200 bg-surface-muted/40 p-3.5 dark:border-neutral-800 text-xs text-neutral-500">
        Change status to <span className="font-bold text-foreground">&quot;ACCEPTED&quot;</span> above to unlock deal conversion into a sales order.
      </div>
    );
  } else {
    convertContent = (
      <form action={convertFormAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="County" htmlFor="county">
            <Select id="county" name="county" defaultValue="" required>
              <option value="" disabled>
                Select county
              </option>
              {KENYA_COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Town" htmlFor="town">
            <Input id="town" name="town" placeholder="e.g. Westlands" required />
          </FormField>
        </div>
        <FormField label="Delivery Location (optional)" htmlFor="deliveryLocation">
          <Input id="deliveryLocation" name="deliveryLocation" placeholder="Specific building or site landmark" />
        </FormField>
        <FormField label="Delivery Instructions (optional)" htmlFor="deliveryInstructions">
          <Textarea id="deliveryInstructions" name="deliveryInstructions" rows={2} placeholder="Driver or technician entry notes" />
        </FormField>
        <FormField label="Payment Method" htmlFor="paymentMethod">
          <Select id="paymentMethod" name="paymentMethod" defaultValue="MANUAL">
            {ALL_PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </Select>
        </FormField>

        {convertState?.error && <p className="text-xs font-semibold text-danger-600">{convertState.error}</p>}

        <Button type="submit" disabled={convertPending} className="gap-2 font-bold w-full">
          {convertPending ? "Converting Deal…" : "Convert Quotation to Order"}
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-2xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-brand-600" />
            <CardTitle>Status & Sharing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={statusFormAction} className="flex flex-col gap-3">
            <FormField label="Quotation Status" htmlFor="status">
              <Select
                id="status"
                name="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={!editable}
              >
                {QUOTATION_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </FormField>
            {statusState?.error && <p className="text-xs font-semibold text-danger-600">{statusState.error}</p>}

            {justSavedStatus && (
              <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Status updated & workflow refreshed!
              </p>
            )}

            {editable && (
              <Button type="submit" size="sm" disabled={statusPending} className="self-start gap-1.5 font-bold text-xs">
                {statusPending ? "Updating Status…" : "Update Status"}
              </Button>
            )}
          </form>

          <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Actions & Dispatch</span>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/admin/quotations/${quotationId}/pdf?download=1`}
                download={`${quotationNumber}.pdf`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold flex-1" })}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold flex-1" })}
                >
                  <MessageCircle className="h-4 w-4 text-success-700 dark:text-success-200" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-brand-600" />
            <CardTitle>Convert to Order</CardTitle>
          </div>
        </CardHeader>
        <CardContent>{convertContent}</CardContent>
      </Card>

      {/* Live PDF Quotation Preview Card */}
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Live PDF Preview</CardTitle>
          </div>
          <a
            href={`/admin/quotations/${quotationId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1"
          >
            <span>Fullscreen</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-muted shadow-inner">
            <iframe
              src={`/admin/quotations/${quotationId}/pdf#navpanes=0&view=FitH`}
              className="w-full h-[540px] border-0"
              title={`Quotation ${quotationNumber} Live PDF Preview`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
