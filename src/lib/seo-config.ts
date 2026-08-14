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
