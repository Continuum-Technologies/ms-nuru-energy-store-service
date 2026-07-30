import type { TextareaHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";

/** Props for {@link Textarea}. Extends every native `<textarea>` attribute. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
  /** Marks the field as invalid — red border/ring and `aria-invalid`. */
  invalid?: boolean;
}

/** Themed multi-line text field (product descriptions, notes, etc.). */
export function Textarea({ className, invalid, ref, ...props }: Readonly<TextareaProps>) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-24 w-full rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-neutral-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger-600 focus-visible:ring-danger-600",
        className,
      )}
      {...props}
    />
  );
}
