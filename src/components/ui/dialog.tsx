"use client";

import { useImperativeHandle, useRef, useEffect, type Ref, type ReactNode } from "react";
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

// Built on the native <dialog> element. Centered with `fixed inset-0 m-auto h-fit`
// so Tailwind preflight CSS resets cannot push it to the top-left of the viewport.
export function Dialog({ ref, title, children, className, onClose }: Readonly<DialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  // Handle native backdrop click imperatively so JSX accessibility rules (jsx-a11y) are satisfied
  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialogEl) {
        dialogEl.close();
      }
    };

    dialogEl.addEventListener("click", handleBackdropClick);
    return () => dialogEl.removeEventListener("click", handleBackdropClick);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-modal="true"
      className={cn(
        "fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-neutral-950/60 backdrop:backdrop-blur-xs",
        className,
      )}
    >
      {title && (
        <div className="border-b border-border/80 px-5 py-4">
          <h2 className="text-base font-extrabold text-foreground tracking-tight">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </dialog>
  );
}
