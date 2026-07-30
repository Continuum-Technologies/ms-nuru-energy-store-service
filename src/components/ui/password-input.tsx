"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/**
 * Password field with a lock icon and a show/hide toggle button.
 *
 * Built on top of {@link Input} — a password field is about to be needed in
 * at least two more places (staff account creation, password reset), so this
 * is a shared primitive rather than a login-page-only one-off.
 *
 * @param props - All standard input props except `type` and `icon`, which
 * this component controls itself (`type` toggles between `"password"` and
 * `"text"`; `icon` is always the lock glyph).
 */
export function PasswordInput({
  className,
  ...props
}: Readonly<Omit<InputProps, "type" | "icon">>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        icon={<Lock className="h-4 w-4" />}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
