import type { NextConfig } from "next";

// Product/category/brand images are served from RustFS (self-hosted,
// S3-compatible — see CLAUDE.md's "Object storage" note). next/image needs
// an explicit remotePattern to optimize them; read straight from
// process.env (not the Zod-validated src/lib/env.ts) since next.config runs
// before that module's other required vars are guaranteed to be checked.
const rustfsPublicUrl = new URL(process.env.RUSTFS_PUBLIC_URL ?? "http://localhost:9000");

const nextConfig: NextConfig = {
  // Traces the minimal set of node_modules actually imported at runtime into
  // .next/standalone — the production Dockerfile copies only that output,
  // not the full node_modules (@prisma alone is ~170MB), so this is what
  // keeps the final image small. Has no effect on `next dev`.
  output: "standalone",
  allowedDevOrigins: ['192.168.88.3'],
  images: {
    remotePatterns: [
      {
        protocol: rustfsPublicUrl.protocol.replace(":", "") as "http" | "https",
        hostname: rustfsPublicUrl.hostname,
        port: rustfsPublicUrl.port || undefined,
      },
    ],
  },
};

export default nextConfig;
