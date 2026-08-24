import type { NextConfig } from "next";

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
        protocol: "https",
        hostname: "nuruenergy.co.ke",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
