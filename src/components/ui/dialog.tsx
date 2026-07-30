"use client";

import { useImperativeHandle, useRef, type Ref, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogHandle {
  open: () => void;
  close: () => void;
}

export interface DialogProps {
  ref?: Ref<DialogHandle>;
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

// Built on the native <dialog> element rather than a portal+focus-trap
// library — it gives ESC-to-close, focus trapping and ::backdrop styling for
// free. Consumers open/close it imperatively via the ref.
export function Dialog({ ref, title, children, className, onClose }: Readonly<DialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
      className={cn(
        "w-full max-w-md rounded-card border border-border bg-surface p-0 text-foreground shadow-popover backdrop:bg-neutral-950/50",
        className,
      )}
    >
      {title && (
        <div className="border-b border-border p-4">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </dialog>
  );
}
