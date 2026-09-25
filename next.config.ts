import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  staticPageGenerationTimeout: 180,
  experimental: {
    // NOTE: `inlineCss: true` was tried for Lighthouse's "Render-blocking
    // requests" and REJECTED — measured: gzip'd homepage HTML grew from
    // 130 KB to 232 KB (the ~216 KB of CSS is embedded repeatedly), which on
    // slow 4G costs more than the 4 stylesheet round trips it removes.
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
    // AVIF dropped: confirmed live that self-hosted next/image was encoding
    // every product image variant to AVIF via sharp/libvips on the server —
    // AVIF costs ~5-10x the CPU/memory of WebP per encode, and that cost is
    // NATIVE (off the V8 heap), so a JS heap profiler never sees it. Under
    // real product-catalog traffic (many images x many device-size variants
    // x 2 qualities, all encoded on first request), this is the most likely
    // driver of the reported hourly OOM crashes / 502s / 48GB+ RSS growth.
    // WebP alone still gives modern-format compression with a much cheaper
    // encode, no visible quality change for visitors.
    formats: ["image/webp"],
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
