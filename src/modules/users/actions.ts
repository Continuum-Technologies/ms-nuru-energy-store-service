"use server";

import { redirect } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, invalidateCurrentSession } from "@/lib/auth/session";
import { loginSchema } from "@/modules/users/schema";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1000 * 60 * 15; // 15 minutes

const GENERIC_LOGIN_ERROR = "Incorrect email or password.";

// A Server Function is reachable via direct POST, not only through the login
// form that calls it (Next.js 16 note, CLAUDE.md §7) — every check below runs
// server-side regardless of what the client showed.
export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  const { email, password } = parsed.data;

  const user = await db.adminUser.findUnique({ where: { email } });

  // Same generic error whether the account doesn't exist or the password is
  // wrong, and regardless of lockout state below — don't leak account
  // existence to an unauthenticated caller.
  if (!user?.isActive) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Account temporarily locked due to repeated failed logins. Try again later." };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
    await db.adminUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts, lockedUntil },
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  await createSession(user.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await invalidateCurrentSession();
  redirect("/admin/login");
}
