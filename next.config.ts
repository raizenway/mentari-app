import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mode for production
  output: 'standalone',

  // Optimize build for limited resources
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
