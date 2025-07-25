import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ensure TypeScript errors are treated as build failures
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
