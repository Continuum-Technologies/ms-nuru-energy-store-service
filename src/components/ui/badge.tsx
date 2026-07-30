import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// The one shared palette every status badge draws from — order, payment,
// quotation and stock statuses all map onto these five tones rather than
// each module inventing its own colors (CLAUDE.md §5 / "Implementation
// conventions").
const badgeVariants = cva("inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-surface-muted text-foreground",
      brand: "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-200",
      success: "bg-success-50 text-success-700 dark:bg-success-600/15 dark:text-success-200",
      warning: "bg-warning-50 text-warning-700 dark:bg-warning-600/15 dark:text-warning-200",
      danger: "bg-danger-50 text-danger-700 dark:bg-danger-600/15 dark:text-danger-200",
      info: "bg-info-50 text-info-700 dark:bg-info-600/15 dark:text-info-200",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: Readonly<BadgeProps>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
