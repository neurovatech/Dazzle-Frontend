/**
 * Single source of truth for SEO-wide constants.
 *
 * SITE_URL must match `metadataBase` in src/app/layout.tsx and the canonical
 * URLs the backend returns in `metaTags.canonical`.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://dazzle.com.bd";

/**
 * Routes that must never be indexed.
 *
 * Two categories:
 *  1. Private / transactional (cart, checkout, profile, auth) — no search value,
 *     and they waste crawl budget.
 *  2. Token-bearing URLs (email verification, password reset) — these contain
 *     secrets in the path. Indexing them would make the tokens publicly
 *     searchable, so excluding them is a security requirement, not just SEO.
 */
export const NOINDEX_PATHS = [
  "/cart",
  "/checkout",
  "/profile",
  "/auth",
  "/order-tracking",
  "/verify-email-token",
  "/reset-password-token",
  "/newsletter-unsubscribe",
  "/product-compare",
] as const;

/** Metadata fragment for pages that must not be indexed. */
export const NOINDEX_METADATA = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
} as const;

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── Open Graph / social-share sharing ─────────────────────────────────────
//
// Every page defines its own `openGraph` object because each needs a
// different title/description/image. But Next.js does NOT deep-merge
// `openGraph` with the root layout's — a page that sets its own `openGraph`
// silently loses siteName/locale unless it sets them again itself. That gap
// is why shared links were showing the raw domain instead of "Dazzle" as the
// site name. SITE_NAME/OG_LOCALE exist so every page can restate them
// consistently in one line.

/** Must match `siteName`/`locale` in the root layout's own openGraph block. */
export const SITE_NAME = "Dazzle";
export const OG_LOCALE = "en_BD";

/**
 * Product thumbnails on the CDN were sampled directly and are consistently
 * 1200x1263. Category/brand artwork is NOT — those are e.g. 487x512 — which is
 * why these are exported for the product page to opt into explicitly rather
 * than being applied to every image by default.
 *
 * Declaring dimensions helps crawlers (notably WhatsApp) lay out the preview on
 * the very first scrape, before they've fetched the file. But declaring WRONG
 * dimensions is worse than declaring none: the preview gets cropped or stretched.
 * So dimensions are opt-in per call site, never assumed.
 */
export const PRODUCT_IMAGE_WIDTH = 1200;
export const PRODUCT_IMAGE_HEIGHT = 1263;

/**
 * The site logo, used as a last-resort fallback when a page has no photo of
 * its own (e.g. a category with no banner). Its real measured size is only
 * 141x27 — a wordmark, not a share graphic. Facebook's documented minimum is
 * 200x200, so this WILL under-perform (small/awkward preview) until a proper
 * ~1200x630 social banner exists. Wire that in here the moment one is
 * available — everything downstream (every page below) will pick it up
 * automatically since they all resolve through DEFAULT_OG_IMAGE.
 */
const SITE_LOGO_URL = "https://dazzle.sgp1.cdn.digitaloceanspaces.com/32680/logo.png";
const SITE_LOGO_WIDTH = 141;
const SITE_LOGO_HEIGHT = 27;

export interface OgImage {
  url: string;
  alt: string;
  type?: string;
  width?: number;
  height?: number;
}

/** The last-resort image for pages that have nothing more specific to show. */
export const DEFAULT_OG_IMAGE: OgImage = {
  url: SITE_LOGO_URL,
  width: SITE_LOGO_WIDTH,
  height: SITE_LOGO_HEIGHT,
  alt: SITE_NAME,
  type: "image/png",
};

/**
 * Builds an og:image (and matching twitter:image) entry from a real content
 * photo — product thumbnail, category artwork, store photo, campaign image.
 * Falls back to DEFAULT_OG_IMAGE when no URL is given, so a page NEVER ships
 * with a completely missing preview image.
 *
 * `size` is optional and must only be passed when the dimensions are genuinely
 * known for that image class (see PRODUCT_IMAGE_WIDTH/HEIGHT). When omitted, no
 * width/height is emitted and the crawler measures the file itself — correct,
 * just marginally slower on the very first scrape.
 */
export function buildOgImage(
  url: string | undefined | null,
  alt: string,
  size?: { width: number; height: number },
): OgImage {
  if (!url) return DEFAULT_OG_IMAGE;
  const isJpeg = /\.jpe?g(\?|$)/i.test(url);
  return {
    url,
    alt,
    type: isJpeg ? "image/jpeg" : "image/png",
    ...(size ? { width: size.width, height: size.height } : {}),
  };
}
