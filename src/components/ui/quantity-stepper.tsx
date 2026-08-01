import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Shared +/- quantity control — CLAUDE.md §5 names this as a primitive to
 * build once in `components/ui`; the cart's line items and the product
 * detail page's quantity picker are its two consumers. Purely controlled:
 * the caller owns the value and decides what happens on change (a local
 * state update on the PDP, a server round trip on the cart page).
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Infinity,
  disabled,
  className,
}: Readonly<QuantityStepperProps>) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.trunc(next) || min));

  return (
    <div className={cn("inline-flex items-center rounded-control border border-border", className)}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="h-8 w-10 border-x border-border bg-transparent text-center text-sm text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
