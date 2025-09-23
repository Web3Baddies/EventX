import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Do not fail production builds on ESLint errors (speed during iteration)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: allow production builds to succeed even if there are type errors
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Explicit root to silence workspace root inference warning
    root: __dirname,
  },
};

export default nextConfig;
