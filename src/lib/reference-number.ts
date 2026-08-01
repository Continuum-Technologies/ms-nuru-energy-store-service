const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids look-alike chars on a support call

function randomSuffix(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}

/**
 * `{PREFIX}-YYMMDD-XXXX` — dependency-injected retry-on-collision, same
 * shape as `src/lib/slug.ts`'s `generateUniqueSlug`. Shared by order numbers
 * (`NE-...`) and quotation numbers (`NQ-...`) rather than duplicating the
 * date-formatting/collision-retry logic per module.
 */
export async function generateReferenceNumber(
  prefix: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");

  let candidate = `${prefix}-${datePart}-${randomSuffix(4)}`;
  while (await isTaken(candidate)) {
    candidate = `${prefix}-${datePart}-${randomSuffix(4)}`;
  }
  return candidate;
}
