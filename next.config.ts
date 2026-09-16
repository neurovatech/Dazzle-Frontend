import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
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
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
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
