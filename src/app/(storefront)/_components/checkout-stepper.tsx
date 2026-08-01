import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

export function CheckoutStepper({ currentStep }: Readonly<CheckoutStepperProps>) {
  const steps = [
    { number: 1, label: "Cart Details", href: "/cart" },
    { number: 2, label: "Delivery & Address", href: "/checkout" },
    { number: 3, label: "Confirmation", href: "#" },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          const renderStepItem = () => {
            if (isCompleted) {
              return (
                <Link
                  href={step.href}
                  className="flex items-center gap-1.5 font-bold text-success-700 hover:text-success-800 dark:text-success-400"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-600 text-white dark:bg-success-500">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span>{step.label}</span>
                </Link>
              );
            }

            if (isActive) {
              return (
                <span className="flex items-center gap-1.5 font-extrabold text-brand-600 dark:text-brand-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {step.number}
                  </span>
                  <span>{step.label}</span>
                </span>
              );
            }

            return (
              <span className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {step.number}
                </span>
                <span>{step.label}</span>
              </span>
            );
          };

          return (
            <div key={step.number} className="flex items-center gap-2 sm:gap-4">
              {idx > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
              {renderStepItem()}
            </div>
          );
        })}
      </div>

      <Link
        href="/shop"
        className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Continue Shopping
      </Link>
    </div>
  );
}
