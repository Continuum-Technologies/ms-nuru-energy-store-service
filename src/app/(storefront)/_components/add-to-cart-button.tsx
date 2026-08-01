"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/modules/cart/actions";
import { cn } from "@/lib/cn";

export interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  /** "icon" for the grid card (compact), "full" for the PDP purchase panel. */
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Shared by `ProductCard` and `ProductPurchasePanel` — never nested inside a
 * `Link` (an interactive control inside an `<a>` is invalid HTML), so the
 * card places this as a sibling below the image/title link, not inside it.
 */
export function AddToCartButton({ productId, quantity = 1, variant = "full", className }: Readonly<AddToCartButtonProps>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  if (variant === "icon") {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          size="sm"
          variant={added ? "outline" : "primary"}
          className={cn("h-8 w-8 p-0", className)}
          onClick={handleClick}
          disabled={pending}
          aria-label="Add to cart"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
        </Button>
        {error && <p className="text-[10px] text-danger-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" className={cn("gap-2 font-bold", className)} onClick={handleClick} disabled={pending}>
        <ShoppingCart className="h-4 w-4" />
        {pending ? "Adding…" : added ? "Added to Cart" : "Add to Cart"}
      </Button>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}
