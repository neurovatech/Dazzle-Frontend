const SPACES_HOSTS = new Set([
  "dazzle.sgp1.cdn.digitaloceanspaces.com",
  "dzl.sgp1.cdn.digitaloceanspaces.com",
]);

function spacesPath(src: string): string | null {
  try {
    const url = new URL(src);
    if (!SPACES_HOSTS.has(url.hostname)) return null;
    return `/media${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

/**
 * Rewrites Spaces URLs to same-origin /media paths.
 * Next.js does not optimize these, so nothing is written under /app/.next.
 * nginx must proxy /media/ to the Spaces bucket.
 */
export default function imageLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("/media/")) return src;

  const direct = spacesPath(src);
  if (direct) return direct;

  if (src.includes("/_next/image")) {
    try {
      const url = src.startsWith("http")
        ? new URL(src)
        : new URL(src, "https://dazzle.com.bd");
      const inner = url.searchParams.get("url");
      if (inner) {
        const unwrapped = spacesPath(inner);
        if (unwrapped) return unwrapped;
      }
    } catch {
      // Keep the original src when it is not a Spaces image URL.
    }
  }

  return src;
}
