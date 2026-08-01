import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartWithItems } from "@/modules/cart/queries";
import { CheckoutSummary } from "./_components/checkout-summary";
import { CheckoutForm } from "./_components/checkout-form";
import { CheckoutStepper } from "../_components/checkout-stepper";

export const metadata: Metadata = {
  title: "Checkout | Nuru Energy Store",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const cart = await getCartWithItems();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const items = cart.items.map((item) => {
    const image = item.product.images[0];
    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        sellingPrice: Number(item.product.sellingPrice),
        imageUrl: image?.url ?? null,
        imageAlt: image?.altText ?? null,
      },
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
      <CheckoutStepper currentStep={2} />

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-3xl">Delivery & Checkout</h1>
        <p className="text-sm text-neutral-500">Provide your shipping address and preferred payment method to place your order.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-5">
          <CheckoutSummary items={items} subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
