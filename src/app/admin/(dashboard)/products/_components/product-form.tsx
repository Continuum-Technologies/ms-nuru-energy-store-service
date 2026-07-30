"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { BasicInfoSection, type BasicInfoValues } from "@/app/admin/(dashboard)/products/_components/basic-info-section";
import { PricingSection, type PricingValues } from "@/app/admin/(dashboard)/products/_components/pricing-section";
import { DeliverySection, type DeliveryValues } from "@/app/admin/(dashboard)/products/_components/delivery-section";
import { SeoSection, type SeoValues } from "@/app/admin/(dashboard)/products/_components/seo-section";

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

/**
 * Composes the four "core" product sections (Basic Info, Pricing, Delivery,
 * SEO) into one form — used by both /admin/products/new and the [id]/edit
 * page. Inventory/Images/Specifications/Publishing are separate, independent
 * mini-forms on the edit page since they need an existing productId.
 */
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
      <BasicInfoSection initialValues={initialValues} categories={categories} brands={brands} />
      <PricingSection initialValues={initialValues} />
      <DeliverySection initialValues={initialValues} />
      <SeoSection initialValues={initialValues} />

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
