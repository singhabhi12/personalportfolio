import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Pin the workspace root; a stray package-lock.json in the home directory
  // otherwise makes Turbopack infer /Users/kyodemer as the root.
  turbopack: { root: __dirname },
};

export default nextConfig;
