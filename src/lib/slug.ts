/** Lowercase, hyphenated, URL-safe slug from a name (e.g. `"5kVA Inverter!"` → `"5kva-inverter"`). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slugifies `name`, then appends `-2`, `-3`, etc. until `isTaken` reports the
 * candidate is free. Shared by every entity with a unique slug (Category,
 * Brand, Product, and later Article) rather than duplicating this per module.
 *
 * @param isTaken - Should check the DB for a conflicting slug. When editing an
 * existing record, exclude that record's own id from the check.
 */
export async function generateUniqueSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
