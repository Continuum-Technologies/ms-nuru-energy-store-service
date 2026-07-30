"use client";

import { useActionState, useState, type FocusEvent } from "react";
import { Mail } from "lucide-react";
import { login } from "@/modules/users/actions";
import { loginSchema } from "@/modules/users/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";

type Field = "email" | "password";
type FieldErrors = Partial<Record<Field, string>>;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  // Client-side validation is for instant feedback only — the Server
  // Function re-validates everything itself regardless (CLAUDE.md §9).
  function validate(field: Field, value: string) {
    const result = loginSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  function handleBlur(field: Field) {
    return (event: FocusEvent<HTMLInputElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validate(field, event.target.value);
    };
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          invalid={touched.email && !!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onBlur={handleBlur("email")}
        />
        {touched.email && fieldErrors.email && (
          <p id="email-error" className="text-xs text-danger-600">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={touched.password && !!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          onBlur={handleBlur("password")}
        />
        {touched.password && fieldErrors.password && (
          <p id="password-error" className="text-xs text-danger-600">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
