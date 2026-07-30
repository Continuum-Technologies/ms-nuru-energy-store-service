const kesFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

/** Formats a numeric amount as Kenyan Shillings, e.g. `formatKes(12400)` → `"Ksh 12,400"`. */
export function formatKes(amount: number): string {
  return kesFormatter.format(amount);
}
