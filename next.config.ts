import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No `output: "export"`: app/api/contact needs a server to run on, and
     Vercel provides one. The pages themselves still prerender to static HTML. */
  images: { unoptimized: true },
  // Pin the workspace root; a stray package-lock.json in the home directory
  // otherwise makes Turbopack infer /Users/kyodemer as the root.
  turbopack: { root: __dirname },
};

export default nextConfig;
