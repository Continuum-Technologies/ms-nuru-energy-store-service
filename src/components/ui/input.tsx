import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

/** Props for {@link Input}. Extends every native `<input>` attribute. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  /** Marks the field as invalid — red border/ring and `aria-invalid`. */
  invalid?: boolean;
  /** Leading icon (e.g. a lucide-react icon element) rendered inside the field. */
  icon?: ReactNode;
}

/**
 * Themed text input, the base building block for every form field in the app.
 *
 * Renders a bare `<input>` when no `icon` is given, or an `<input>` inside a
 * `relative` wrapper with the icon absolutely positioned on the left when one
 * is provided. {@link PasswordInput} builds on this for its trailing
 * show/hide toggle.
 */
export function Input({ className, invalid, icon, ref, ...props }: Readonly<InputProps>) {
  const input = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground placeholder:text-neutral-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        icon && "pl-9",
        invalid && "border-danger-600 focus-visible:ring-danger-600",
        className,
      )}
      {...props}
    />
  );

  if (!icon) return input;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
        {icon}
      </span>
      {input}
    </div>
  );
}
