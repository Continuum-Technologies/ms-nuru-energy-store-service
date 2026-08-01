"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { CUSTOMER_PAYMENT_METHODS } from "@/modules/orders/schemas";
import { submitOrder } from "@/modules/orders/actions";

const PAYMENT_METHOD_LABELS: Record<(typeof CUSTOMER_PAYMENT_METHODS)[number], string> = {
  MPESA_TILL: "M-Pesa Till",
  MPESA_PAYBILL: "M-Pesa Paybill",
  BANK_TRANSFER: "Bank Transfer",
  CASH_ON_DELIVERY: "Cash on Delivery",
  PAYMENT_ON_COLLECTION: "Payment on Collection",
};

export function CheckoutForm() {
  const [state, formAction, pending] = useActionState(submitOrder, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-surface p-5">
      <h2 className="text-sm font-bold text-foreground">Delivery & Contact Details</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="guestName">
          <Input id="guestName" name="guestName" placeholder="Jane Wanjiru" required />
        </FormField>
        <FormField label="Phone Number" htmlFor="guestPhone">
          <PhoneInput id="guestPhone" name="guestPhone" required />
        </FormField>
      </div>

      <FormField label="Email (optional)" htmlFor="guestEmail">
        <Input id="guestEmail" name="guestEmail" type="email" placeholder="jane@example.com" />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="County" htmlFor="county">
          <Select id="county" name="county" defaultValue="" required>
            <option value="" disabled>
              Select county
            </option>
            {KENYA_COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Town" htmlFor="town">
          <Input id="town" name="town" placeholder="e.g. Westlands" required />
        </FormField>
      </div>

      <FormField label="Delivery Location (optional)" htmlFor="deliveryLocation" hint="Estate, building, or landmark to help our driver find you.">
        <Input id="deliveryLocation" name="deliveryLocation" placeholder="e.g. Sunset Apartments, Block C" />
      </FormField>

      <FormField label="Delivery Instructions (optional)" htmlFor="deliveryInstructions">
        <Textarea id="deliveryInstructions" name="deliveryInstructions" rows={2} placeholder="Gate code, preferred delivery time, etc." />
      </FormField>

      <FormField label="Preferred Payment Method" htmlFor="paymentMethod">
        <Select id="paymentMethod" name="paymentMethod" defaultValue="" required>
          <option value="" disabled>
            Select payment method
          </option>
          {CUSTOMER_PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Order Notes (optional)" htmlFor="customerNotes">
        <Textarea id="customerNotes" name="customerNotes" rows={2} placeholder="Anything else we should know about your order?" />
      </FormField>

      {state?.error && (
        <div role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full gap-2 font-bold">
        <CheckCircle2 className="h-4 w-4" />
        {pending ? "Placing Order…" : "Place Order"}
      </Button>
    </form>
  );
}
