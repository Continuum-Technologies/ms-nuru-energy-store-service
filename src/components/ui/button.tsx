import type { ButtonHTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        secondary: "bg-surface-muted text-foreground hover:bg-border",
        outline: "border border-border bg-transparent text-foreground hover:bg-surface-muted",
        ghost: "text-foreground hover:bg-surface-muted",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** Props for {@link Button}. Extends every native `<button>` attribute. */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Themed button used across the storefront and admin dashboard.
 *
 * @param variant - Visual style: `primary` (default), `secondary`, `outline`,
 * `ghost`, or `danger` for destructive actions.
 * @param size - `sm`, `md` (default), or `lg`.
 *
 * @example
 * ```tsx
 * <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
 * ```
 *
 * To style a `<Link>` (or any non-button element) the same way, use the
 * exported {@link buttonVariants} function instead of this component, so the
 * element stays a real `<a>` for correct navigation semantics.
 */
export function Button({ className, variant, size, ref, ...props }: Readonly<ButtonProps>) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
