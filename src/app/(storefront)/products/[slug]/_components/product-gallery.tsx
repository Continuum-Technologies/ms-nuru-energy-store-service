"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { PackageSearch } from "lucide-react";

export interface ProductGalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface ProductGalleryProps {
  images: ProductGalleryImage[];
  productName: string;
}

/** Main image + thumbnail strip, ordered as passed in (caller sorts primary-first). */
export function ProductGallery({ images, productName }: Readonly<ProductGalleryProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-surface-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.altText ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <PackageSearch className="h-12 w-12 stroke-1" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-brand-600" : "border-border/60",
              )}
            >
              <Image src={image.url} alt={image.altText ?? productName} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
