"use client";

import { useActionState, useEffect, useRef } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateStaffMember } from "@/modules/staff/admin-actions";

const ROLE_OPTIONS = [
  { value: "SALES", label: "Sales Officer (Quotations & Order Management)" },
  { value: "INVENTORY", label: "Inventory Manager (Stock & Catalog)" },
  { value: "CONTENT", label: "Content Editor (Website & Branding)" },
  { value: "ADMINISTRATOR", label: "Administrator (Store Operations & Staff Management)" },
  { value: "OWNER", label: "Owner (System Administrator & Full Access)" },
];

export interface EditStaffDialogProps {
  staffId: string;
  name: string;
  email: string;
  role: string;
}

export function EditStaffDialog({ staffId, name, email, role }: Readonly<EditStaffDialogProps>) {
  const dialogRef = useRef<DialogHandle>(null);
  const [state, formAction, pending] = useActionState(updateStaffMember.bind(null, staffId), undefined);
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !pending && !state?.error) {
      dialogRef.current?.close();
    }
    prevPending.current = pending;
  }, [pending, state]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs font-bold gap-1"
        onClick={() => dialogRef.current?.open()}
      >
        <Edit2 className="h-3 w-3" />
        Edit Profile
      </Button>

      <Dialog ref={dialogRef} title={`Edit Staff Profile — ${name}`}>
        <form action={formAction} className="flex flex-col gap-4">
          <p className="text-xs text-neutral-500">
            Update employee profile details, adjust role permissions, or optionally reset their account password.
          </p>

          <FormField label="Full Name" htmlFor={`name-${staffId}`}>
            <Input id={`name-${staffId}`} name="name" defaultValue={name} required />
          </FormField>

          <FormField label="Work Email Address" htmlFor={`email-${staffId}`}>
            <Input id={`email-${staffId}`} name="email" type="email" defaultValue={email} required />
          </FormField>

          <FormField label="Staff Role Assignment" htmlFor={`role-${staffId}`}>
            <Select id={`role-${staffId}`} name="role" defaultValue={role} required disabled={role === "OWNER"}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Reset Password (Optional)" htmlFor={`newPassword-${staffId}`}>
            <Input
              id={`newPassword-${staffId}`}
              name="newPassword"
              type="password"
              placeholder="Leave blank to keep existing password"
            />
          </FormField>

          {state?.error && <p className="text-xs font-semibold text-danger-600">{state.error}</p>}

          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending} className="gap-1.5 font-bold">
              {pending ? "Saving Changes…" : "Save Staff Details"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
