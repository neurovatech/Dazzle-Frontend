import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Optimized images were served with `max-age=14400` (Next's 4-hour default),
    // which PageSpeed flagged under "Use efficient cache lifetimes".
    // 30 days is safe here because product image URLs are path-versioned by an
    // upload id (e.g. /43465/...), so replacing an image yields a NEW url.
    // Do NOT raise this if any workflow overwrites an image at the same path.
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
