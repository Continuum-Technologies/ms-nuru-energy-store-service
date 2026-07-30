import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines conditional class names (clsx) and resolves conflicting Tailwind
// utilities in favor of the last one (tailwind-merge) — e.g. cn("p-2", isBig && "p-4")
// correctly yields "p-4" instead of both classes fighting in the stylesheet.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
