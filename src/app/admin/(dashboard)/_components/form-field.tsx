import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + optional hint text, shared by every admin create/edit form. */
export function FormField({ label, htmlFor, hint, children }: Readonly<FormFieldProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
