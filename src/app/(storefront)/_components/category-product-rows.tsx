import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveCategories, getCategoryProductPreview } from "@/modules/catalog/queries";
import { ProductCard } from "./product-card";

const MAX_ROWS = 3;

/** A "Category — real products" row per top-level category, matching the merchandising pattern from competitor storefronts but with only real, live catalog data — a category with an empty preview (a race with stock/status changes) is simply skipped, not padded with placeholders. */
export async function CategoryProductRows() {
  const categories = await getActiveCategories();
  const candidates = categories.slice(0, MAX_ROWS);

  const rows = await Promise.all(
    candidates.map(async (category) => ({
      category,
      products: await getCategoryProductPreview(category.slug, 6),
    })),
  );

  const nonEmptyRows = rows.filter((row) => row.products.length > 0);
  if (nonEmptyRows.length === 0) {
    return null;
  }

  return (
    <>
      {nonEmptyRows.map(({ category, products }) => (
        <section key={category.id} className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{category.name}</h2>
            <Link
              href={`/categories/${category.slug}`}
              className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {products.map((product) => (
              <div key={product.id} className="w-44 shrink-0 snap-start sm:w-52">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
