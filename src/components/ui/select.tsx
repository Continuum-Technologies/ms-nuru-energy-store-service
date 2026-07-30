import type { SelectHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";

/** Props for {@link Select}. Extends every native `<select>` attribute. */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  /** Marks the field as invalid — red border/ring and `aria-invalid`. */
  invalid?: boolean;
}

/** Themed `<select>` dropdown — pass `<option>` elements as children. */
export function Select({ className, invalid, ref, children, ...props }: Readonly<SelectProps>) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger-600 focus-visible:ring-danger-600",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
