import { api } from "@/lib/api";

/**
 * Server-side prefetch for the banner / Top Selling / Trending blocks that sit
 * ABOVE the product list on brand and category pages.
 *
 * Those blocks used to be fetched only in the browser. Until the answer came
 * back they showed tall skeletons, and for a brand/category that has no banner
 * or no showcase products they then disappeared — collapsing ~1,000px and
 * yanking the product list (and everything under it) upwards. A layout shift
 * that large on a single page view is what the field CLS report flagged.
 *
 * Fetching on the server removes the "loading" state entirely: the HTML already
 * holds the final block (or nothing), so there is nothing to swap or collapse.
 *
 * The result is tagged with the slug + param it was fetched for. The client
 * hands it to React Query as `initialData` ONLY while its own query key matches
 * that tag — after the visitor picks a brand/category chip the key changes and
 * the normal client fetch takes over (a stale `initialData` must never be shown
 * for a different chip).
 */
export interface PrefetchedQuery<T> {
  slug: string;
  param: string;
  response: T;
}

async function prefetch<T>(
  path: string,
  slug: string,
  param: string,
  fresh: boolean,
): Promise<PrefetchedQuery<T> | undefined> {
  try {
    const response = await api.get<T>(
      path,
      // Free-form slugs (a chip the visitor typed into the URL) are fetched
      // fresh so each one does not become its own file in the fetch cache.
      fresh ? { cache: "no-store" } : { next: { revalidate: 300 } },
    );
    return response ? { slug, param, response } : undefined;
  } catch {
    // The client component falls back to its own fetch — page still works.
    return undefined;
  }
}

export const prefetchBanner = <T>(slug: string, param: string, fresh = false) =>
  prefetch<T>(`/banner-escalate/${slug}?${param}=1`, slug, param, fresh);

export const prefetchShowcase = <T>(slug: string, param: string, fresh = false) =>
  prefetch<T>(`/showcase-escalate/${slug}?${param}=1`, slug, param, fresh);
