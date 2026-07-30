import { z } from "zod";

// Validated once at import time so a missing/invalid env var fails fast at
// boot instead of surfacing as a confusing runtime error deep in a request.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_COOKIE_NAME: z.string().min(1).default("nuru_session"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RUSTFS_ENDPOINT: z.string().min(1, "RUSTFS_ENDPOINT is required"),
  RUSTFS_ACCESS_KEY: z.string().min(1, "RUSTFS_ACCESS_KEY is required"),
  RUSTFS_SECRET_KEY: z.string().min(1, "RUSTFS_SECRET_KEY is required"),
  RUSTFS_BUCKET: z.string().min(1, "RUSTFS_BUCKET is required"),
  RUSTFS_PUBLIC_URL: z.string().min(1, "RUSTFS_PUBLIC_URL is required"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  NODE_ENV: process.env.NODE_ENV,
  RUSTFS_ENDPOINT: process.env.RUSTFS_ENDPOINT,
  RUSTFS_ACCESS_KEY: process.env.RUSTFS_ACCESS_KEY,
  RUSTFS_SECRET_KEY: process.env.RUSTFS_SECRET_KEY,
  RUSTFS_BUCKET: process.env.RUSTFS_BUCKET,
  RUSTFS_PUBLIC_URL: process.env.RUSTFS_PUBLIC_URL,
});
