import Link from "next/link";
import { Zap, ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/modules/users/actions";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/initials";
import type { AdminUser } from "@/generated/prisma/client";

export interface TopHeaderProps {
  user: AdminUser;
}

/**
 * Persistent top bar across every admin page. The user's identity is fully
 * shown in the desktop sidebar's {@link UserPanel}; on mobile (where the
 * sidebar is hidden) this is the only place it appears, so it gets a compact
 * avatar alongside sign-out.
 */
export function TopHeader({ user }: Readonly<TopHeaderProps>) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md transition-all md:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-control font-bold text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight text-foreground">
              Nuru Energy
            </span>
            <span className="text-[10px] font-medium leading-tight text-neutral-400">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-surface-muted hover:text-foreground dark:text-neutral-300 sm:flex"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3 w-3 text-neutral-400" />
        </Link>


        {/* Mobile-only identity + sign-out — the sidebar UserPanel covers this on desktop. */}
        <div className="flex items-center gap-1.5 md:hidden">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-xs font-bold text-white shadow-sm"
          >
            {getInitials(user.name)}
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-500">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
