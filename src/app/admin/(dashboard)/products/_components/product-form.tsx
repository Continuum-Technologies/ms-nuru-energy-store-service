"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { BasicInfoSection, type BasicInfoValues } from "@/app/admin/(dashboard)/products/_components/basic-info-section";
import { PricingSection, type PricingValues } from "@/app/admin/(dashboard)/products/_components/pricing-section";
import { DeliverySection, type DeliveryValues } from "@/app/admin/(dashboard)/products/_components/delivery-section";
import { SeoSection, type SeoValues } from "@/app/admin/(dashboard)/products/_components/seo-section";
import { ArrowLeft, Check } from "lucide-react";

type FormState = { error: string } | undefined;

export type ProductFormValues = BasicInfoValues & PricingValues & DeliveryValues & SeoValues;

export interface ProductFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  initialValues?: ProductFormValues;
  cancelHref: string;
  submitLabel?: string;
}

export function ProductForm({
  action,
  categories,
  brands,
  initialValues,
  cancelHref,
  submitLabel = "Save product",
}: Readonly<ProductFormProps>) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Multi-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (Main Information & Delivery Specs) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <BasicInfoSection initialValues={initialValues} categories={categories} brands={brands} />
          <DeliverySection initialValues={initialValues} />
        </div>

        {/* Right Column (Pricing & Financials + SEO Metadata) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <PricingSection initialValues={initialValues} />
          <SeoSection initialValues={initialValues} />
        </div>
      </div>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}>
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>
        <Button type="submit" disabled={pending} size="sm" className="gap-1.5 font-bold">
          <Check className="h-4 w-4" />
          {pending ? "Saving Product…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
