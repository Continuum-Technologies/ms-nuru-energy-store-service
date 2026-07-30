"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteRowButtonProps {
  /** A `deleteX(formData)` Server Function that reads `formData.get("id")`. */
  action: (formData: FormData) => Promise<{ error: string } | void>;
  id: string;
  /** Lowercase entity noun for the confirmation copy, e.g. "category". */
  label: string;
  /** The specific record's display name, shown in the confirmation copy. */
  name: string;
}

/**
 * Icon button that opens a {@link Dialog} confirmation before calling a
 * delete Server Function directly (not a form submission) — shared by every
 * admin list page's delete action so the confirm-then-call flow isn't
 * rebuilt per entity.
 */
export function DeleteRowButton({ action, id, label, name }: Readonly<DeleteRowButtonProps>) {
  const dialogRef = useRef<DialogHandle>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        dialogRef.current?.close();
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
        onClick={() => {
          setError(null);
          dialogRef.current?.open();
        }}
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog ref={dialogRef} title={`Delete this ${label}?`}>
        <p className="text-sm text-neutral-500">
          This will permanently delete <span className="font-medium text-foreground">{name}</span>. This
          can&apos;t be undone.
        </p>
        {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={handleConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
