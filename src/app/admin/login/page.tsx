import Link from "next/link";
import { Zap } from "lucide-react";
import { LoginForm } from "@/app/admin/login/_components/login-form";

const VALUE_PROPS = [
  "Manage products, orders and quotations from your phone",
  "M-Pesa, bank transfer and cash-on-delivery, built in",
  "Full inventory and order history, always up to date",
];

export default function AdminLoginPage() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen">
      {/* Brand panel — hidden below md, where the compact header below stands in for it. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 p-10 text-white md:flex lg:p-16">
        <Zap
          aria-hidden="true"
          strokeWidth={1}
          className="pointer-events-none absolute -top-16 -right-16 h-80 w-80 text-white/10"
        />

        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-6 w-6" />
          Nuru Energy
        </div>

        <div className="relative flex flex-col gap-6">
          <h2 className="text-2xl font-semibold leading-snug lg:text-3xl">
            Solar, power and machinery for Kenya — run from one dashboard.
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-white/80">
            {VALUE_PROPS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">© {year} Nuru Energy</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 md:px-16">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground md:hidden">
            <Zap className="h-6 w-6 text-brand-600" />
            Nuru Energy
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Staff sign in</h1>
            <p className="text-sm text-neutral-500">Sign in to manage products, orders and quotations.</p>
          </div>

          <LoginForm />

          <div className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-xs text-neutral-500">
            <Link href="/" className="hover:text-brand-600">
              ← Back to store
            </Link>
            <p className="md:hidden">© {year} Nuru Energy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
