import { LogOut } from "lucide-react";
import { logout } from "@/modules/users/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/initials";
import type { AdminUser } from "@/generated/prisma/client";
import { StaffRole } from "@/generated/prisma/client";

const ROLE_LABELS: Record<StaffRole, string> = {
  [StaffRole.OWNER]: "Owner",
  [StaffRole.ADMINISTRATOR]: "Administrator",
  [StaffRole.SALES]: "Sales",
  [StaffRole.INVENTORY]: "Inventory",
  [StaffRole.CONTENT]: "Content",
};

/** Sidebar footer: avatar, name, role badge, and the sign-out action. */
export function UserPanel({ user }: Readonly<{ user: AdminUser }>) {
  const roleTone = user.role === StaffRole.OWNER ? "brand" : "neutral";

  return (
    <div className="flex flex-col gap-3 border-t border-border/80 bg-surface/50 p-3.5 dark:bg-neutral-900/40">
      <div className="flex items-center gap-3 px-1">
        <div className="relative">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-xs font-bold text-white shadow-sm ring-2 ring-background"
          >
            {getInitials(user.name)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success-600 ring-2 ring-background"
            title="Active staff session"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge tone={roleTone} className="w-fit px-2 py-0 text-[10px] font-semibold uppercase tracking-wider">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
      </div>

      <form action={logout}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs font-medium text-neutral-600 hover:border-danger-200 hover:bg-danger-50 hover:text-danger-700 dark:text-neutral-400 dark:hover:bg-danger-600/20 dark:hover:text-danger-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
