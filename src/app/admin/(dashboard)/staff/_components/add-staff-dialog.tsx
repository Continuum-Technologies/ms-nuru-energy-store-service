"use client";

import { useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createStaffMember } from "@/modules/staff/admin-actions";

const ROLE_OPTIONS = [
  { value: "SALES", label: "Sales Officer (Quotations & Order Management)" },
  { value: "INVENTORY", label: "Inventory Manager (Stock & Catalog)" },
  { value: "CONTENT", label: "Content Editor (Website & Branding)" },
  { value: "ADMINISTRATOR", label: "Administrator (Store Operations & Staff Management)" },
];

export function AddStaffDialog() {
  const dialogRef = useRef<DialogHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createStaffMember, undefined);
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      dialogRef.current?.close();
    }
    prevPending.current = pending;
  }, [pending, state]);

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="gap-1.5 font-bold text-xs"
        onClick={() => dialogRef.current?.open()}
      >
        <UserPlus className="h-4 w-4" />
        Add Staff Member
      </Button>

      <Dialog ref={dialogRef} title="Register New Staff Account">
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <p className="text-xs text-neutral-500">
            Create a staff account with specific role-based permissions for order fulfillment, stock management, or sales.
          </p>

          <FormField label="Full Name" htmlFor="name">
            <Input id="name" name="name" placeholder="e.g. Samuel Kibet" required />
          </FormField>

          <FormField label="Work Email Address" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="e.g. s.kibet@nuruenergy.co.ke" required />
          </FormField>

          <FormField label="Initial Password" htmlFor="password">
            <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" required />
          </FormField>

          <FormField label="Staff Role Assignment" htmlFor="role">
            <Select id="role" name="role" defaultValue="SALES" required>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>

          {state?.error && <p className="text-xs font-semibold text-danger-600">{state.error}</p>}

          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending} className="gap-1.5 font-bold">
              {pending ? "Creating Account…" : "Create Staff Account"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
