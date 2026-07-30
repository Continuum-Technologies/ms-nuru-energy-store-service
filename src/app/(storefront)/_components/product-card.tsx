import Link from "next/link";
import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { StockBadge } from "@/components/ui/stock-badge";
import { getAvailabilityStatus } from "@/lib/inventory-status";
import type { ProductCardData } from "@/modules/catalog/queries";

export interface ProductCardProps {
  product: ProductCardData;
}

/** Grid tile shared by /shop, /categories/[slug], /brands/[slug] and /search. */
export function ProductCard({ product }: Readonly<ProductCardProps>) {
  const image = product.images[0];
  const status = getAvailabilityStatus(product.inventoryItem, product.isQuotationOnly);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface p-3 transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <PackageSearch className="h-8 w-8 stroke-1" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {product.brand && <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{product.brand.name}</span>}
        <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <PriceDisplay
          sellingPrice={Number(product.sellingPrice)}
          previousPrice={product.previousPrice ? Number(product.previousPrice) : null}
          hidePrice={product.hidePrice}
          isQuotationOnly={product.isQuotationOnly}
        />
        <StockBadge status={status} className="self-start" />
      </div>
    </Link>
  );
}
