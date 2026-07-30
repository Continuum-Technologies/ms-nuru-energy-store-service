import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("rounded-card border border-border bg-surface shadow-card", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("flex flex-col gap-1 border-b border-border p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: Readonly<HTMLAttributes<HTMLHeadingElement>>) {
  return <h3 className={cn("text-base font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: Readonly<HTMLAttributes<HTMLParagraphElement>>) {
  return <p className={cn("text-sm text-neutral-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("flex items-center gap-2 border-t border-border p-4", className)} {...props} />
  );
}
