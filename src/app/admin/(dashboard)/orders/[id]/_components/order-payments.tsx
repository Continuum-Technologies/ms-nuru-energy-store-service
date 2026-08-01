"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import { recordPayment, processRefund } from "@/modules/orders/admin-actions";
import type { PaymentStatus } from "@/generated/prisma/client";

const PAYMENT_STATUS_TONE: Record<PaymentStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  INITIATED: "info",
  PROCESSING: "info",
  SUCCESSFUL: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
  VERIFICATION_REQUIRED: "warning",
  PARTIALLY_PAID: "warning",
  REFUNDED: "danger",
  PARTIALLY_REFUNDED: "danger",
};

export interface OrderPaymentRow {
  id: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  providerReference: string | null;
  paidAt: Date | null;
  notes: string | null;
}

export interface OrderPaymentsProps {
  orderId: string;
  payments: OrderPaymentRow[];
}

export function OrderPayments({ orderId, payments }: Readonly<OrderPaymentsProps>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Payment Transactions & Receipts</CardTitle>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {payments.length} {payments.length === 1 ? "Transaction" : "Transactions"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        {payments.map((payment) => (
          <PaymentRow key={payment.id} orderId={orderId} payment={payment} />
        ))}
      </CardContent>
    </Card>
  );
}

function PaymentRow({ orderId, payment }: Readonly<{ orderId: string; payment: OrderPaymentRow }>) {
  const router = useRouter();
  const [recordSuccessToast, setRecordSuccessToast] = useState(false);
  const [refundSuccessToast, setRefundSuccessToast] = useState(false);

  const [recordState, recordFormAction, recordPending] = useActionState(recordPayment.bind(null, orderId), undefined);
  const [refundState, refundFormAction, refundPending] = useActionState(processRefund.bind(null, orderId), undefined);

  const prevRecordPending = useRef(false);
  const prevRefundPending = useRef(false);

  useEffect(() => {
    if (prevRecordPending.current && !recordPending && !recordState?.error) {
      setRecordSuccessToast(true);
      router.refresh();
      const timer = setTimeout(() => setRecordSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevRecordPending.current = recordPending;
  }, [recordPending, recordState, router]);

  useEffect(() => {
    if (prevRefundPending.current && !refundPending && !refundState?.error) {
      setRefundSuccessToast(true);
      router.refresh();
      const timer = setTimeout(() => setRefundSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevRefundPending.current = refundPending;
  }, [refundPending, refundState, router]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">
            {payment.method.replaceAll("_", " ")}
          </span>
          <span className="text-[11px] font-mono text-neutral-500">Ref: {payment.reference}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-extrabold text-foreground">{formatKes(payment.amount)}</span>
          <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status.replaceAll("_", " ")}</Badge>
        </div>
      </div>

      {payment.notes && <p className="text-xs text-neutral-500 italic bg-surface p-2 rounded-lg border border-border/40">{payment.notes}</p>}

      {recordSuccessToast && (
        <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Payment marked as paid & order refreshed!
        </p>
      )}

      {refundSuccessToast && (
        <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Refund processed successfully!
        </p>
      )}

      {payment.status === "PENDING" && (
        <form action={recordFormAction} className="flex flex-col gap-2.5 border-t border-border/60 pt-3">
          <input type="hidden" name="paymentId" value={payment.id} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input name="providerReference" placeholder="Provider code (e.g. M-Pesa transaction ID)" required />
            <Input name="notes" placeholder="Payment notes (optional)" />
          </div>
          {recordState?.error && <p className="text-xs font-semibold text-danger-600">{recordState.error}</p>}
          <Button type="submit" size="sm" disabled={recordPending} className="self-start gap-1.5 font-bold text-xs">
            {recordPending ? "Recording…" : "Confirm Payment Received"}
          </Button>
        </form>
      )}

      {(payment.status === "SUCCESSFUL" || payment.status === "PARTIALLY_PAID") && (
        <form action={refundFormAction} className="flex flex-col gap-2.5 border-t border-border/60 pt-3">
          <input type="hidden" name="paymentId" value={payment.id} />
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <Checkbox name="partial" />
            <span>Partial refund transaction</span>
          </label>
          <Input name="notes" placeholder="Refund reason / notes (optional)" />
          {refundState?.error && <p className="text-xs font-semibold text-danger-600">{refundState.error}</p>}
          <Button type="submit" size="sm" variant="outline" disabled={refundPending} className="self-start gap-1.5 font-bold text-xs">
            {refundPending ? "Processing…" : "Issue Refund"}
          </Button>
        </form>
      )}
    </div>
  );
}
