import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No `output: "export"`: app/api/contact needs a server to run on, and
     Vercel provides one. The pages themselves still prerender to static HTML. */
  images: { unoptimized: true },
  // Pin the workspace root; a stray package-lock.json in the home directory
  // otherwise makes Turbopack infer /Users/kyodemer as the root.
  turbopack: { root: __dirname },
  // Dev only. Next refuses cross-origin dev requests, which is every request
  // that arrives through a tunnel — without this the page loads and then sits
  // there with no hot reload, because the HMR socket is the thing rejected.
  // Only ever reached by `next dev`; `next build` ignores it.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
};

export default nextConfig;
