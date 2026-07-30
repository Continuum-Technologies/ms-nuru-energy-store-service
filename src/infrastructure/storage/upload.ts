import "server-only";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, ensureBucketExists } from "@/infrastructure/storage/client";
import { env } from "@/lib/env";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class InvalidImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export interface UploadedImage {
  url: string;
  key: string;
}

/**
 * Uploads an image to the configured RustFS bucket under `folder/`, with a
 * generated, collision-proof filename — never the client-supplied one (per
 * CLAUDE.md §9's file-upload checklist: allow-listed types, a size cap, and
 * safe generated filenames rather than trusting user input).
 */
export async function uploadImage(
  file: Buffer,
  contentType: string,
  folder: string,
): Promise<UploadedImage> {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new InvalidImageError(`Unsupported image type: ${contentType}`);
  }
  if (file.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new InvalidImageError("Image exceeds the 5MB size limit");
  }

  await ensureBucketExists();

  const key = `${folder}/${randomUUID()}.${EXTENSION_BY_TYPE[contentType]}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.RUSTFS_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  return { url: `${env.RUSTFS_PUBLIC_URL}/${env.RUSTFS_BUCKET}/${key}`, key };
}

/** `key` is the path returned alongside `url` from {@link uploadImage}. */
export async function deleteImage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: env.RUSTFS_BUCKET, Key: key }));
}
