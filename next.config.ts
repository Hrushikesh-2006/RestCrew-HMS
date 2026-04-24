import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // swcMinify: false, // Deprecated in Next.js 14+
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
};

export default nextConfig;
