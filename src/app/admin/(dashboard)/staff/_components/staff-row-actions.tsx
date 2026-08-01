"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Unlock, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleStaffStatus, unlockStaffAccount } from "@/modules/staff/admin-actions";
import { EditStaffDialog } from "./edit-staff-dialog";

export interface StaffRowActionsProps {
  staffId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isLocked: boolean;
  isSelf: boolean;
}

export function StaffRowActions({
  staffId,
  name,
  email,
  role,
  isActive,
  isLocked,
  isSelf,
}: Readonly<StaffRowActionsProps>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleStatus() {
    setError(null);
    startTransition(async () => {
      const res = await toggleStaffStatus(staffId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleUnlock() {
    setError(null);
    startTransition(async () => {
      const res = await unlockStaffAccount(staffId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1 items-end justify-end">
      <div className="flex items-center justify-end gap-1.5">
        <EditStaffDialog staffId={staffId} name={name} email={email} role={role} />

        {isLocked && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleUnlock}
            className="h-7 text-xs font-bold gap-1 text-warning-700 dark:text-warning-300 border-warning-500/30"
          >
            <Unlock className="h-3 w-3" />
            Unlock
          </Button>
        )}

        {!isSelf && role !== "OWNER" && (
          <Button
            type="button"
            variant={isActive ? "outline" : "primary"}
            size="sm"
            disabled={pending}
            onClick={handleToggleStatus}
            className="h-7 text-xs font-bold gap-1"
          >
            <Power className="h-3 w-3" />
            {isActive ? "Deactivate" : "Activate"}
          </Button>
        )}

        {isSelf && (
          <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 pl-1">
            Active Session
          </span>
        )}
      </div>

      {error && <span className="text-[10px] text-danger-600 font-semibold">{error}</span>}
    </div>
  );
}
