import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/infrastructure/database/client";
import { env } from "@/lib/env";
import type { AdminUser } from "@/generated/prisma/client";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days, fixed — no sliding renewal for now.

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

// Only the hash is ever persisted — a stolen DB row can't be replayed as a
// live session cookie (CLAUDE.md "Implementation conventions").
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

// Must be called from a Server Function or Route Handler (cookies().set is
// not permitted during rendering).
export async function createSession(adminUserId: string): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const requestHeaders = await headers();

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      adminUserId,
      expiresAt,
      userAgent: requestHeaders.get("user-agent") ?? undefined,
      ipAddress: requestHeaders.get("x-forwarded-for") ?? undefined,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    ...cookieOptions(),
    expires: expiresAt,
  });
}

// Wrapped in React's cache() so the layout and page can both call this in the
// same request without hitting the database twice.
export const getCurrentStaffSession = cache(async (): Promise<{ user: AdminUser } | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date() || !session.adminUser.isActive) {
    return null;
  }

  return { user: session.adminUser };
});

// Throws rather than returning null — call sites (layouts, Server Functions)
// decide how to present "not logged in" (redirect, 401 response, etc).
export async function requireStaffSession(): Promise<{ user: AdminUser }> {
  const session = await getCurrentStaffSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

// Must be called from a Server Function or Route Handler.
export async function invalidateCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}
