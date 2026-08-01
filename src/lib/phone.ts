import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

/**
 * True only for a real, valid Kenyan number (mobile or landline) in any
 * commonly-typed format: `0712345678`, `712345678`, `254712345678`,
 * `+254712345678`. Backed by `libphonenumber-js` rather than a hand-rolled
 * regex, so it's not fooled by the wrong number of digits or an invalid
 * prefix the way a simple pattern match can be.
 */
export function isValidKenyanPhone(phone: string): boolean {
  return parsePhoneNumberFromString(phone, "KE")?.isValid() ?? false;
}

/**
 * The single source of truth for turning whatever format a phone number was
 * typed in into one consistent stored value (`+254712345678`) — this is
 * what stops `+254715404275` and `0715404275` from being treated as two
 * different customers. Every module that writes a phone number (customers,
 * orders, quotations) normalizes through this before storage.
 */
export function normalizeKenyanPhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone, "KE");
  if (parsed?.isValid()) {
    return parsed.format("E.164");
  }
  // Defensive fallback only — callers validate with isValidKenyanPhone
  // (via kenyanPhoneSchema) before this ever runs.
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("254") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
  return `+254${local}`;
}

/** Shared Zod validator for every form that collects a Kenyan phone number — one message, one rule, not a regex copy-pasted per schema. */
export const kenyanPhoneSchema = z
  .string()
  .refine(isValidKenyanPhone, { message: "Enter a valid Kenyan phone number (e.g. 0712345678)" });
