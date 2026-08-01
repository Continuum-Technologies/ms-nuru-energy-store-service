"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/client";
import { requirePermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/auth/password";
import { StaffRole } from "@/generated/prisma/client";

/** Helper to safely extract and trim string values from FormData without File stringification warnings */
function getFormString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

/**
 * Creates a new staff member account. Requires `staff.manage` permission.
 */
export async function createStaffMember(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const actor = await requirePermission("staff.manage");

  const name = getFormString(formData, "name");
  const email = getFormString(formData, "email")?.toLowerCase();
  const password = getFormString(formData, "password");
  const roleInput = getFormString(formData, "role") as StaffRole | undefined;

  if (!name || !email || !password || !roleInput) {
    return { error: "Please provide name, email, password, and select a staff role." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (!Object.values(StaffRole).includes(roleInput)) {
    return { error: "Invalid staff role selected." };
  }

  // Check if email already exists
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: "A staff account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await db.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: roleInput,
      isActive: true,
    },
  });

  // Record audit log entry
  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "STAFF_MEMBER_CREATED",
      entityType: "AdminUser",
      entityId: newUser.id,
      newValue: { name, email, role: roleInput },
    },
  });

  revalidatePath("/admin/staff");
  return undefined;
}

/**
 * Toggles a staff member's active status (deactivate / reactivate). Requires `staff.manage`.
 */
export async function toggleStaffStatus(
  staffId: string,
): Promise<{ error: string } | undefined> {
  const actor = await requirePermission("staff.manage");

  const target = await db.adminUser.findUnique({ where: { id: staffId } });
  if (!target) {
    return { error: "Staff member not found." };
  }

  // Protection: Cannot deactivate the OWNER account
  if (target.role === StaffRole.OWNER) {
    return { error: "The primary Owner account cannot be deactivated." };
  }

  // Protection: Cannot deactivate self
  if (target.id === actor.id) {
    return { error: "You cannot deactivate your own active session account." };
  }

  const newStatus = !target.isActive;

  await db.adminUser.update({
    where: { id: staffId },
    data: { isActive: newStatus },
  });

  // If deactivating, revoke all active sessions for security
  if (!newStatus) {
    await db.session.deleteMany({ where: { adminUserId: staffId } });
  }

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: newStatus ? "STAFF_MEMBER_ACTIVATED" : "STAFF_MEMBER_DEACTIVATED",
      entityType: "AdminUser",
      entityId: staffId,
      previousValue: { isActive: target.isActive },
      newValue: { isActive: newStatus },
    },
  });

  revalidatePath("/admin/staff");
  return undefined;
}

/**
 * Unlocks a staff account that was locked due to repeated failed logins. Requires `staff.manage`.
 */
export async function unlockStaffAccount(
  staffId: string,
): Promise<{ error: string } | undefined> {
  const actor = await requirePermission("staff.manage");

  const target = await db.adminUser.findUnique({ where: { id: staffId } });
  if (!target) {
    return { error: "Staff member not found." };
  }

  await db.adminUser.update({
    where: { id: staffId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "STAFF_ACCOUNT_UNLOCKED",
      entityType: "AdminUser",
      entityId: staffId,
      previousValue: { failedLoginAttempts: target.failedLoginAttempts, lockedUntil: target.lockedUntil },
      newValue: { failedLoginAttempts: 0, lockedUntil: null },
    },
  });

  revalidatePath("/admin/staff");
  return undefined;
}

/**
 * Updates a staff member's RBAC role. Requires `staff.manage`.
 */
export async function updateStaffRole(
  staffId: string,
  newRole: StaffRole,
): Promise<{ error: string } | undefined> {
  const actor = await requirePermission("staff.manage");

  const target = await db.adminUser.findUnique({ where: { id: staffId } });
  if (!target) {
    return { error: "Staff member not found." };
  }

  if (target.role === StaffRole.OWNER) {
    return { error: "The Owner role cannot be reassigned." };
  }

  await db.adminUser.update({
    where: { id: staffId },
    data: { role: newRole },
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "STAFF_ROLE_UPDATED",
      entityType: "AdminUser",
      entityId: staffId,
      previousValue: { role: target.role },
      newValue: { role: newRole },
    },
  });

  revalidatePath("/admin/staff");
  return undefined;
}

/**
 * Updates an existing staff member's profile (name, email, role, and optional new password). Requires `staff.manage`.
 */
export async function updateStaffMember(
  staffId: string,
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const actor = await requirePermission("staff.manage");

  const target = await db.adminUser.findUnique({ where: { id: staffId } });
  if (!target) {
    return { error: "Staff member not found." };
  }

  const name = getFormString(formData, "name");
  const email = getFormString(formData, "email")?.toLowerCase();
  const roleInput = getFormString(formData, "role") as StaffRole | undefined;
  const newPassword = getFormString(formData, "newPassword");

  if (!name || !email || !roleInput) {
    return { error: "Name, email, and role assignment are required." };
  }

  if (!Object.values(StaffRole).includes(roleInput)) {
    return { error: "Invalid staff role selected." };
  }

  if (target.role === StaffRole.OWNER && roleInput !== StaffRole.OWNER) {
    return { error: "The Owner role cannot be demoted." };
  }

  if (email !== target.email) {
    const existing = await db.adminUser.findUnique({ where: { email } });
    if (existing && existing.id !== staffId) {
      return { error: "Another staff account is already using this email address." };
    }
  }

  const updateData: { name: string; email: string; role: StaffRole; passwordHash?: string } = {
    name,
    email,
    role: roleInput,
  };

  if (newPassword && newPassword.length > 0) {
    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters long." };
    }
    updateData.passwordHash = await hashPassword(newPassword);
  }

  await db.adminUser.update({
    where: { id: staffId },
    data: updateData,
  });

  await db.auditLog.create({
    data: {
      actorId: actor.id,
      action: "STAFF_MEMBER_UPDATED",
      entityType: "AdminUser",
      entityId: staffId,
      previousValue: { name: target.name, email: target.email, role: target.role },
      newValue: { name, email, role: roleInput, passwordChanged: Boolean(newPassword) },
    },
  });

  revalidatePath("/admin/staff");
  return undefined;
}
