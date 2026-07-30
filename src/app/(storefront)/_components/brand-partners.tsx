import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/infrastructure/database/client";

/**
 * Brands actually in the catalog (`Brand.isFeatured`), queried live — not a
 * claimed "official partnership" with named manufacturers. Naming real
 * companies as partners with no real backing data would be an unverified
 * factual claim about third parties, not just placeholder UI (CLAUDE.md
 * §10). Renders nothing while the catalog is empty, rather than a fake list.
 */
export async function BrandPartners() {
  const brands = await db.brand.findMany({
    where: { isActive: true, isFeatured: true },
    select: { id: true, name: true },
    take: 6,
    orderBy: { name: "asc" },
  });

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface-muted/40 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-bold text-foreground">Brands We Stock</span>
        </div>
        <Link href="/shop" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
          View All Brands
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-surface p-3 text-center transition-colors hover:border-brand-500/40"
          >
            <span className="text-xs font-black text-foreground">{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
