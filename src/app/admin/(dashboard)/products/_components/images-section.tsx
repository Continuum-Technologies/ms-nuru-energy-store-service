"use client";

import { useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Upload, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { addProductImage, deleteProductImage, setPrimaryProductImage } from "@/modules/catalog/products/actions";

export interface ProductImageValue {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

/**
 * Edit-only — a new product has no productId yet to attach images to.
 * Uploads go through `/api/uploads` (RustFS), then `addProductImage()` persists
 * the row. Plain `<img>` rather than `next/image`: these are dynamic external
 * RustFS URLs in an admin-only tool, not the public storefront where image
 * optimization matters for SEO/performance.
 */
export function ImagesSection({
  productId,
  images,
}: Readonly<{ productId: string; images: ProductImageValue[] }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "products");

      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Upload failed.");
        return;
      }

      startTransition(() => {
        addProductImage({ productId, url: result.url, key: result.key });
      });
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {images.length === 0 ? (
          <p className="text-sm text-neutral-500">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-control border border-border">
                <Image
                  src={image.url}
                  alt={image.altText ?? ""}
                  width={200}
                  height={200}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
                {image.isPrimary && (
                  <span className="absolute left-1.5 top-1.5 rounded-pill bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Primary
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-neutral-950/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!image.isPrimary && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-white hover:bg-white/20"
                      onClick={() => startTransition(() => setPrimaryProductImage(image.id))}
                      aria-label="Set as primary image"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                    onClick={() => startTransition(() => deleteProductImage(image.id))}
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2 self-start"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        {error && <p className="text-sm text-danger-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
