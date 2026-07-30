import "server-only";
import { redirect } from "next/navigation";
import { StaffRole, type AdminUser } from "@/generated/prisma/client";
import { requireStaffSession, UnauthorizedError } from "@/lib/auth/session";

// Fixed permission set for a fixed 5-role staff model (CLAUDE.md §3). Adding a
// new capability means adding one key here and slotting it into the roles
// that should have it below — no schema migration required.
export const PERMISSIONS = [
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "products.publish",
  "pricing.edit",
  "categories.manage",
  "brands.manage",
  "inventory.view",
  "inventory.adjust",
  "orders.view",
  "orders.manage",
  "orders.cancel",
  "orders.refund",
  "payments.record",
  "payments.settings.manage",
  "quotations.view",
  "quotations.manage",
  "quotations.convert",
  "customers.view",
  "customers.manage",
  "content.manage",
  "staff.manage",
  "security.manage",
  "settings.manage",
  "reports.view",
  "reports.view.financial",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

const ALL_PERMISSIONS = new Set<Permission>(PERMISSIONS);

// Row-level exceptions this coarse matrix can't express (e.g. an
// Administrator can manage staff but can never delete the Owner account, or
// change ownership) must be enforced separately, in the staff module itself.
export const ROLE_PERMISSIONS: Record<StaffRole, ReadonlySet<Permission>> = {
  [StaffRole.OWNER]: ALL_PERMISSIONS,
  [StaffRole.ADMINISTRATOR]: new Set<Permission>([
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.publish",
    "pricing.edit",
    "categories.manage",
    "brands.manage",
    "inventory.view",
    "inventory.adjust",
    "orders.view",
    "orders.manage",
    "orders.cancel",
    "orders.refund",
    "payments.record",
    "quotations.view",
    "quotations.manage",
    "quotations.convert",
    "customers.view",
    "customers.manage",
    "content.manage",
    "staff.manage",
    "settings.manage",
    "reports.view",
    "audit.view",
  ]),
  [StaffRole.SALES]: new Set<Permission>([
    "products.view",
    "orders.view",
    "orders.manage",
    "payments.record",
    "quotations.view",
    "quotations.manage",
    "quotations.convert",
    "customers.view",
    "customers.manage",
  ]),
  [StaffRole.INVENTORY]: new Set<Permission>([
    "products.view",
    "inventory.view",
    "inventory.adjust",
  ]),
  [StaffRole.CONTENT]: new Set<Permission>([
    "products.view",
    "products.create",
    "products.edit",
    "products.publish",
    "categories.manage",
    "brands.manage",
    "content.manage",
  ]),
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

// Composes with requireStaffSession(): confirms the caller is logged in AND
// holds the given permission. Throws UnauthorizedError (no session) or
// ForbiddenError (wrong role) — callers decide how to present either
// (redirect, 403 response, etc).
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const { user } = await requireStaffSession();
  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError(permission);
  }
  return user;
}

/**
 * For gating a whole admin page (not just a mutation) — e.g. a role with only
 * `products.view` shouldn't be able to open the product edit form at all
 * (it renders cost price), not just be blocked from submitting it. Redirects
 * to `/admin` instead of throwing, since a page can't return a form error the
 * way a Server Function can.
 */
export async function requirePermissionOrRedirect(permission: Permission): Promise<AdminUser> {
  try {
    return await requirePermission(permission);
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      redirect("/admin");
    }
    throw error;
  }
}
