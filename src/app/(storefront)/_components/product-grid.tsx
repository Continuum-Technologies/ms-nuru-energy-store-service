import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/modules/catalog/queries";

export interface ProductGridProps {
  products: ProductCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Shared grid of {@link ProductCard}s, reused by /shop, /categories/[slug], /brands/[slug] and /search. */
export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or check back soon.",
}: Readonly<ProductGridProps>) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
