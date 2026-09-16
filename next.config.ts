import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // /products/sitemap.xml fetches the full product catalog (4000+ products,
  // 3 pages of 2000) to list every product URL. The backend takes ~24s to
  // return just one such page (verified live), so the default 60s static
  // generation timeout was failing the ENTIRE production build on this one
  // route. This doesn't speed up the backend — it just gives this
  // legitimately slow, catalog-wide route (revalidated at most every 6h
  // anyway, per its own `revalidate` export) enough room to finish instead
  // of aborting the whole build.
  staticPageGenerationTimeout: 180,
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
