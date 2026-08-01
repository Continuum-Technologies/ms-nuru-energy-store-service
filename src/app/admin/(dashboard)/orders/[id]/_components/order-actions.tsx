"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, MessageCircle, Phone, Settings2, StickyNote, Ban, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import {
  updateOrderStatus,
  assignOrder,
  updateOrderInternalNotes,
  cancelOrder,
} from "@/modules/orders/admin-actions";
import { ORDER_STATUSES, CANCELLABLE_ORDER_STATUSES } from "@/modules/orders/schemas";

export interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  status: string;
  internalNotes: string | null;
  assignedEmployeeId: string | null;
  staff: { id: string; name: string }[];
  customerPhone: string | null;
}

export function OrderActions({
  orderId,
  orderNumber,
  status,
  internalNotes,
  assignedEmployeeId,
  staff,
  customerPhone,
}: Readonly<OrderActionsProps>) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [selectedAssigned, setSelectedAssigned] = useState(assignedEmployeeId ?? "");
  const [statusSuccessToast, setStatusSuccessToast] = useState(false);
  const [assignSuccessToast, setAssignSuccessToast] = useState(false);
  const [notesSuccessToast, setNotesSuccessToast] = useState(false);

  const [statusState, statusFormAction, statusPending] = useActionState(updateOrderStatus.bind(null, orderId), undefined);
  const [assignState, assignFormAction, assignPending] = useActionState(assignOrder.bind(null, orderId), undefined);
  const [notesState, notesFormAction, notesPending] = useActionState(updateOrderInternalNotes.bind(null, orderId), undefined);

  const prevStatusPending = useRef(false);
  const prevAssignPending = useRef(false);
  const prevNotesPending = useRef(false);

  // Sync state if prop changes from server
  const [prevServerStatus, setPrevServerStatus] = useState(status);
  if (prevServerStatus !== status) {
    setPrevServerStatus(status);
    setSelectedStatus(status);
  }

  const [prevServerAssigned, setPrevServerAssigned] = useState(assignedEmployeeId);
  if (prevServerAssigned !== assignedEmployeeId) {
    setPrevServerAssigned(assignedEmployeeId);
    setSelectedAssigned(assignedEmployeeId ?? "");
  }

  // Instantly revalidate on status change
  useEffect(() => {
    if (prevStatusPending.current && !statusPending && !statusState?.error) {
      setStatusSuccessToast(true);
      router.refresh();
      const timer = setTimeout(() => setStatusSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevStatusPending.current = statusPending;
  }, [statusPending, statusState, router]);

  // Instantly revalidate on assignment change
  useEffect(() => {
    if (prevAssignPending.current && !assignPending && !assignState?.error) {
      setAssignSuccessToast(true);
      router.refresh();
      const timer = setTimeout(() => setAssignSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevAssignPending.current = assignPending;
  }, [assignPending, assignState, router]);

  // Instantly revalidate on notes save
  useEffect(() => {
    if (prevNotesPending.current && !notesPending && !notesState?.error) {
      setNotesSuccessToast(true);
      router.refresh();
      const timer = setTimeout(() => setNotesSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
    prevNotesPending.current = notesPending;
  }, [notesPending, notesState, router]);

  const canCancel = (CANCELLABLE_ORDER_STATUSES as readonly string[]).includes(status);
  const whatsappHref = customerPhone
    ? `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi! This is Nuru Energy Store regarding your order ${orderNumber}.`,
      )}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-2xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-brand-600" />
            <CardTitle>Status & Assignment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={statusFormAction} className="flex flex-col gap-3">
            <FormField label="Fulfillment Order Status" htmlFor="status">
              <Select
                id="status"
                name="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </FormField>
            {statusState?.error && <p className="text-xs font-semibold text-danger-600">{statusState.error}</p>}
            {statusSuccessToast && (
              <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Order status updated!
              </p>
            )}
            <Button type="submit" size="sm" disabled={statusPending} className="self-start gap-1.5 font-bold text-xs">
              {statusPending ? "Updating…" : "Update Status"}
            </Button>
          </form>

          <form action={assignFormAction} className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <FormField label="Assign Fulfillment Officer" htmlFor="assignedEmployeeId">
              <Select
                id="assignedEmployeeId"
                name="assignedEmployeeId"
                value={selectedAssigned}
                onChange={(e) => setSelectedAssigned(e.target.value)}
              >
                <option value="" disabled>
                  Select staff member
                </option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </FormField>
            {assignState?.error && <p className="text-xs font-semibold text-danger-600">{assignState.error}</p>}
            {assignSuccessToast && (
              <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Staff member assigned!
              </p>
            )}
            <Button type="submit" size="sm" disabled={assignPending} className="self-start gap-1.5 font-bold text-xs">
              {assignPending ? "Assigning…" : "Assign Officer"}
            </Button>
          </form>

          <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Communication & Print</span>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/admin/orders/${orderId}/pdf?download=1`}
                download={`${orderNumber}.pdf`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold flex-1" })}
              >
                <Download className="h-4 w-4" />
                Invoice PDF
              </a>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold" })}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs font-bold" })}
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
            <StickyNote className="h-4 w-4 text-brand-600" />
            <CardTitle>Internal Operational Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={notesFormAction} className="flex flex-col gap-3">
            <Textarea
              name="internalNotes"
              rows={3}
              defaultValue={internalNotes ?? ""}
              placeholder="Notes visible to fulfillment staff only — dispatch details, technician instructions..."
            />
            {notesState?.error && <p className="text-xs font-semibold text-danger-600">{notesState.error}</p>}
            {notesSuccessToast && (
              <p className="text-xs font-bold text-success-700 dark:text-success-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Operational notes saved!
              </p>
            )}
            <Button type="submit" size="sm" disabled={notesPending} className="self-start gap-1.5 font-bold text-xs">
              {notesPending ? "Saving Notes…" : "Save Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {canCancel && (
        <Card className="shadow-2xs border-danger-500/30">
          <CardHeader>
            <CardTitle className="text-danger-700 dark:text-danger-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <CancelOrderButton orderId={orderId} />
          </CardContent>
        </Card>
      )}

      {/* Live Order PDF Preview Card */}
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base font-extrabold">Live Order PDF Preview</CardTitle>
          </div>
          <a
            href={`/admin/orders/${orderId}/pdf`}
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
              src={`/admin/orders/${orderId}/pdf#navpanes=0&view=FitH`}
              className="w-full h-[540px] border-0"
              title={`Order ${orderNumber} Live PDF Preview`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CancelOrderButton({ orderId }: Readonly<{ orderId: string }>) {
  const dialogRef = useRef<DialogHandle>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        className="gap-1.5 font-bold text-xs"
        onClick={() => {
          setError(null);
          dialogRef.current?.open();
        }}
      >
        <Ban className="h-4 w-4" />
        Cancel Order & Release Stock
      </Button>

      <Dialog ref={dialogRef} title="Cancel this order?">
        <p className="text-sm text-neutral-500">
          This will cancel the order and release any reserved stock back into available inventory. This action cannot be undone.
        </p>
        {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
            Keep Order
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={handleConfirm} disabled={pending}>
            {pending ? "Cancelling…" : "Cancel Order"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
