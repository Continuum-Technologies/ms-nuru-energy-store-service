import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { getDealProducts } from "@/modules/catalog/queries";
import { ProductCard } from "./product-card";

/** Real, currently-discounted products only — no fabricated countdown/urgency, since there's no deal-expiry data to back one (CLAUDE.md's "no fabricated claims" rule). Renders nothing when no product has a real markdown. */
export async function DealsOfTheDay() {
  const deals = await getDealProducts(8);

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

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {deals.map((product) => (
          <div key={product.id} className="w-44 shrink-0 snap-start sm:w-52">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
