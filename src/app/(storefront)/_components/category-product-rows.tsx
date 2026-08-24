import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveCategories, getCategoryProductPreview } from "@/modules/catalog/queries";
import { ProductCard } from "./product-card";

const MAX_ROWS = 4;
const PRODUCTS_PER_ROW = 6;

/** A "Category — real products" row per top-level category with a balanced, full-width responsive grid. */
export async function CategoryProductRows() {
  const categories = await getActiveCategories();
  const candidates = categories.slice(0, MAX_ROWS);

  const rows = await Promise.all(
    candidates.map(async (category) => ({
      category,
      products: await getCategoryProductPreview(category.slug, PRODUCTS_PER_ROW),
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
