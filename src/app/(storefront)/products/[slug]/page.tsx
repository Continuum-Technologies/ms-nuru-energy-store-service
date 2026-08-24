import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/modules/catalog/queries";
import { getAvailabilityStatus, type AvailabilityStatus } from "@/lib/inventory-status";
import { env } from "@/lib/env";
import { ProductGallery } from "./_components/product-gallery";
import { ProductSpecsTable } from "./_components/product-specs-table";
import { ProductPurchasePanel } from "./_components/product-purchase-panel";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const SCHEMA_AVAILABILITY: Record<AvailabilityStatus, string> = {
  IN_STOCK: "https://schema.org/InStock",
  LOW_STOCK: "https://schema.org/LimitedAvailability",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  AVAILABLE_ON_REQUEST: "https://schema.org/BackOrder",
};

export async function generateMetadata({ params }: Readonly<ProductPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || `${product.name} Price in Kenya | Nuru Energy`;
  const description = product.seoDescription || product.shortDescription || `${product.name} — available at Nuru Energy.`;
  const primaryImage = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || `/products/${product.slug}` },
    openGraph: primaryImage ? { images: [{ url: primaryImage.url }] } : undefined,
  };
}

export default async function ProductPage({ params }: Readonly<ProductPageProps>) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const availabilityStatus = getAvailabilityStatus(product.inventoryItem, product.isQuotationOnly);
  const sellingPrice = Number(product.sellingPrice);
  const previousPrice = product.previousPrice ? Number(product.previousPrice) : null;
  const hasRealPrice = !product.hidePrice && !product.isQuotationOnly;

  const specs = product.specifications.map((spec) => ({
    label: spec.field.label,
    unit: spec.field.unit,
    value: spec.value,
    displayOrder: spec.field.displayOrder,
  }));

  const siteUrl = env.SITE_URL;
  const productUrl = `${siteUrl}/products/${product.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.shortDescription || product.fullDescription || undefined,
        sku: product.sku,
        image: product.images.map((image) => image.url),
        brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
        ...(hasRealPrice && {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "KES",
            price: sellingPrice,
            availability: SCHEMA_AVAILABILITY[availabilityStatus],
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: product.category.name, item: `${siteUrl}/categories/${product.category.slug}` },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-6 px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-600">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{product.name}</h1>
            {product.model && <p className="text-sm text-neutral-500">Model: {product.model}</p>}
            {product.shortDescription && <p className="text-sm text-neutral-500">{product.shortDescription}</p>}
          </div>

          {product.fullDescription && (
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">{product.fullDescription}</div>
          )}

          <ProductSpecsTable specs={specs} />
        </div>

        <div className="lg:col-span-3">
          <ProductPurchasePanel
            productId={product.id}
            sellingPrice={sellingPrice}
            previousPrice={previousPrice}
            hidePrice={product.hidePrice}
            isQuotationOnly={product.isQuotationOnly}
            availabilityStatus={availabilityStatus}
            brand={product.brand}
            installationAvailable={product.installationAvailable}
            installationRequired={product.installationRequired}
            productSlug={product.slug}
          />
        </div>
      </div>
    </div>
  );
}
