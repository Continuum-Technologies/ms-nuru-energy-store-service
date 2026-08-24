import type { Metadata } from "next";
import { getProductBySlug } from "@/modules/catalog/queries";
import { getCartWithItems } from "@/modules/cart/queries";
import { QuotationRequestForm } from "./_components/quotation-request-form";
import { QuotationRequestSummary, type QuotationRequestSummaryItem } from "./_components/quotation-request-summary";

export const metadata: Metadata = {
  title: "Request a Quotation | Nuru Energy",
  robots: { index: false, follow: false },
};

interface RequestQuotationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RequestQuotationPage({ searchParams }: Readonly<RequestQuotationPageProps>) {
  const { product: productParam } = await searchParams;
  const productSlug = typeof productParam === "string" ? productParam : undefined;

  let contextSource: "product" | "cart" | "" = "";
  let summaryItems: QuotationRequestSummaryItem[] = [];
  let summaryHeading = "";

  if (productSlug) {
    const product = await getProductBySlug(productSlug);
    if (product) {
      contextSource = "product";
      summaryHeading = "Requesting a Quote For";
      const image = product.images[0];
      summaryItems = [
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          sellingPrice: Number(product.sellingPrice),
          imageUrl: image?.url ?? null,
          imageAlt: image?.altText ?? null,
        },
      ];
    }
  } else {
    const cart = await getCartWithItems();
    if (cart.items.length > 0) {
      contextSource = "cart";
      summaryHeading = "Requesting a Quote For Your Cart";
      summaryItems = cart.items.map((item) => {
        const image = item.product.images[0];
        return {
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          sellingPrice: Number(item.product.sellingPrice),
          imageUrl: image?.url ?? null,
          imageAlt: image?.altText ?? null,
        };
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8">
      {/* Compact Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Request a Custom Quotation
        </h1>
        <p className="text-sm text-neutral-500 max-w-3xl">
          For home backup, solar installations, water pumping, or industrial machinery. Complete the form below and our technical sales team will send an official quotation within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          <QuotationRequestForm
            contextSource={contextSource}
            contextProductSlug={contextSource === "product" ? productSlug : undefined}
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-24">
          <QuotationRequestSummary items={summaryItems} heading={summaryHeading} />
        </div>
      </div>
    </div>
  );
}
