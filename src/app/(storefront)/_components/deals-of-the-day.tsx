import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { getDealProducts } from "@/modules/catalog/queries";
import { ProductCard } from "./product-card";

/** Real, currently-discounted products only in a balanced, full-width responsive grid. */
export async function DealsOfTheDay() {
  const deals = await getDealProducts(6);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger-700 dark:text-danger-200">
            <Tag className="h-3.5 w-3.5" />
            Deals
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">Best Current Discounts</h2>
        </div>
        <Link
          href="/shop?onSale=true"
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {deals.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
