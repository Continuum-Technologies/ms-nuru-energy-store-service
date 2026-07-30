import "server-only";
import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

// RustFS is S3-compatible (verified against its own docs), so the standard
// AWS SDK v3 works against it unchanged. `forcePathStyle` is required for
// self-hosted S3-compatible services — virtual-hosted-style addressing
// (`bucket.endpoint`) can't resolve without wildcard DNS. `region` is a
// required SDK parameter but unused by RustFS itself.
export const s3 = new S3Client({
  endpoint: env.RUSTFS_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: env.RUSTFS_ACCESS_KEY,
    secretAccessKey: env.RUSTFS_SECRET_KEY,
  },
  forcePathStyle: true,
});

function publicReadPolicy(bucket: string): string {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucket}/*`,
      },
    ],
  });
}

let bucketReady: Promise<void> | null = null;

/**
 * Idempotent, memoized per server process — creates the configured bucket
 * (with a public-read policy, since product images need to be directly
 * viewable via a plain URL) the first time any upload happens, rather than
 * requiring a manual setup step against the RustFS console.
 */
export function ensureBucketExists(): Promise<void> {
  bucketReady ??= (async () => {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: env.RUSTFS_BUCKET }));
    } catch {
      await s3.send(new CreateBucketCommand({ Bucket: env.RUSTFS_BUCKET }));
      await s3.send(
        new PutBucketPolicyCommand({
          Bucket: env.RUSTFS_BUCKET,
          Policy: publicReadPolicy(env.RUSTFS_BUCKET),
        }),
      );
    }
  })();
  return bucketReady;
}
