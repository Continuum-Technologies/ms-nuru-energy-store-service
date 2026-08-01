"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { requestQuotation } from "@/modules/quotations/actions";

export interface QuotationRequestFormProps {
  contextSource: "product" | "cart" | "";
  contextProductSlug?: string;
}

export function QuotationRequestForm({ contextSource, contextProductSlug }: Readonly<QuotationRequestFormProps>) {
  const [state, formAction, pending] = useActionState(requestQuotation, undefined);

  if (state && "success" in state && state.success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-success-500/20 bg-success-50/30 p-8 sm:p-10 text-center dark:bg-success-500/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-600 text-white dark:bg-success-500 shadow-xs">
          <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <h2 className="text-xl font-extrabold text-foreground">Quotation Request Received!</h2>
          <p className="text-xs text-neutral-500">
            Request Reference: <span className="font-bold font-mono text-foreground">{state.quotationNumber}</span>
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Thank you for reaching out. Our engineering sales desk is reviewing your requirements and will contact you via phone/email with an official PDF quotation.
          </p>
        </div>
        <Link href="/shop" className={buttonVariants({ className: "gap-2 font-bold mt-2" })}>
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs">
      <input type="hidden" name="contextSource" value={contextSource} />
      {contextProductSlug && <input type="hidden" name="contextProductSlug" value={contextProductSlug} />}

      {/* Section 1: Contact Details */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-2">
          1. Contact & Organization Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full Name" htmlFor="guestName">
            <Input id="guestName" name="guestName" placeholder="Jane Wanjiru" required />
          </FormField>
          <FormField label="Phone Number" htmlFor="guestPhone">
            <PhoneInput id="guestPhone" name="guestPhone" required />
          </FormField>
        </div>

        <FormField label="Email Address (optional)" htmlFor="guestEmail">
          <Input id="guestEmail" name="guestEmail" type="email" placeholder="jane@company.co.ke" />
        </FormField>
      </div>

      {/* Section 2: Project Specifications */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-2">
          2. Project & System Specifications
        </h2>

        {contextSource === "" && (
          <FormField label="What equipment or system are you looking for?" htmlFor="productInterest">
            <Input id="productInterest" name="productInterest" placeholder="e.g. 10kW Solar Array + Lithium Storage for Commercial Dairy Farm" />
          </FormField>
        )}

        {contextSource === "product" && (
          <FormField label="Estimated Unit Quantity" htmlFor="quantity">
            <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Intended Application (optional)" htmlFor="intendedUse">
            <Input id="intendedUse" name="intendedUse" placeholder="e.g. Off-grid power backup, solar water pumping" />
          </FormField>
          <FormField label="Property / Facility Type (optional)" htmlFor="propertyType">
            <Input id="propertyType" name="propertyType" placeholder="e.g. School, Hospital, Farm, Residential" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Current Power Source (optional)" htmlFor="currentPowerSource">
            <Input id="currentPowerSource" name="currentPowerSource" placeholder="e.g. KPLC Grid, Diesel Generator, None" />
          </FormField>
          <FormField label="Estimated Budget Range (optional)" htmlFor="budgetRange">
            <Input id="budgetRange" name="budgetRange" placeholder="e.g. Ksh 300,000 - 600,000" />
          </FormField>
        </div>
      </div>

      {/* Section 3: Timeline & Additional Requirements */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-2">
          3. Timeline & Additional Requirements
        </h2>

        <FormField label="Target Completion Date (optional)" htmlFor="preferredCompletionDate">
          <Input id="preferredCompletionDate" name="preferredCompletionDate" type="date" />
        </FormField>

        <label className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface-muted/30 p-3.5 text-xs font-semibold text-foreground cursor-pointer hover:bg-surface-muted/60 transition-colors">
          <Checkbox name="installationRequired" />
          <span>I require certified EPRA installation & setup services on site</span>
        </label>

        <FormField label="Additional Project Notes (optional)" htmlFor="customerNotes">
          <Textarea id="customerNotes" name="customerNotes" rows={3} placeholder="Provide any technical specifications, site location details, or special delivery notes..." />
        </FormField>
      </div>

      {state && "error" in state && state.error && (
        <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-semibold text-danger-700">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full gap-2 font-bold mt-2">
        <FileText className="h-4 w-4" />
        {pending ? "Submitting Request…" : "Submit Quotation Request"}
      </Button>
    </form>
  );
}
