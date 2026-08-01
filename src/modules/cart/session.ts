import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/infrastructure/database/client";

const CART_COOKIE_NAME = "nuru_cart";
const CART_COOKIE_DURATION_MS = 1000 * 60 * 60 * 24 * 90; // 90 days — "retained for a reasonable period" per PRD §9.1.

function generateCartToken(): string {
  return randomBytes(32).toString("base64url");
}

// Only the hash is ever persisted, same rule as staff sessions
// (src/lib/auth/session.ts) — a stolen DB row can't be replayed as a live
// cart cookie.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CART_COOKIE_DURATION_MS / 1000,
  };
}

/** Read-only — safe to call during rendering. Never creates a cart; a missing cookie just means an empty cart. */
export const getCurrentCart = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!token) return null;

  return db.cart.findUnique({
    where: { sessionToken: hashToken(token) },
  });
});

/** Creates the cookie + `Cart` row on first use. Must be called from a Server Function — cookie writes aren't allowed during rendering (same Next.js constraint as staff auth). */
export async function getOrCreateCart() {
  const existing = await getCurrentCart();
  if (existing) return existing;

  const token = generateCartToken();
  const cart = await db.cart.create({ data: { sessionToken: hashToken(token) } });

  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, token, cookieOptions());

  return cart;
}
