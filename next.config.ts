import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure client-side Web Workers and WASM compile smoothly
  turbopack: {},
};

export default nextConfig;
