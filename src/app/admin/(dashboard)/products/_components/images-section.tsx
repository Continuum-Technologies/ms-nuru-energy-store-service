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
  const [isPending, startTransition] = useTransition();

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
              <div key={image.id} className="flex flex-col overflow-hidden rounded-control border border-border bg-card">
                <div className="relative aspect-square w-full bg-neutral-100">
                  <Image
                    src={image.url}
                    alt={image.altText ?? ""}
                    width={200}
                    height={200}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                  {image.isPrimary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 border-t border-border bg-neutral-50/50 p-1.5">
                  {!image.isPrimary ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-600"
                      disabled={isPending}
                      onClick={() => startTransition(() => setPrimaryProductImage(image.id))}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Set Primary
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-700">
                      <Star className="h-3.5 w-3.5 fill-brand-600 text-brand-600" />
                      Primary Image
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-400 hover:bg-danger-50 hover:text-danger-600"
                    disabled={isPending}
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
