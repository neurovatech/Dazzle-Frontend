import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Tree-shake large packages to reduce Total Blocking Time (TBT)
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "swiper",
      "react-hot-toast",
      "redux",
      "@reduxjs/toolkit",
    ],
  },
  images: {
    // Convert images to modern lightweight formats (AVIF and WebP) automatically
    formats: ["image/avif", "image/webp"],
    // Extended cache TTL for CDN images
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "dazzle.com.bd" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "dazzle.sgp1.cdn.digitaloceanspaces.com" },
      { protocol: "https", hostname: "dzl.sgp1.cdn.digitaloceanspaces.com" },
      { protocol: "https", hostname: "store.storeimages.cdn-apple.com" },
    ],
  },
};

export default nextConfig;
