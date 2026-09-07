/**
 * fetchShowcaseProducts
 *
 * Shared SSR helper for any page that fetches
 * /showcase-items?showcaseSlug={slug}&page={page}&limit={limit}
 *
 * Usage (SSR):
 *   const { products, totalPages } = await fetchShowcaseProducts("hot-deal");
 *
 * Client-side infinite scroll uses mapShowcaseItems() directly after calling
 * the API via api.get().
 */

import { api } from "@/lib/api";
import { sortInStockFirst } from "@/lib/sortProducts";

// ─── Raw API shape ────────────────────────────────────────────────────────────

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

interface ShowcaseItem {
  productUuid:       string;
  productCode?:      string;
  productName:       string;
  productSlug:       string;
  productBadge:      string;
  isTba:             boolean;
  regularPrice:      number;
  discountedPrice:   number;
  disRate:           number;
  thumbnails:        ShowcaseThumbnail | null;
  endOfLife?:        boolean;
  allowPreOrder?:    boolean;
  recognitionBadge?: string;
}

export interface ShowcaseItemsResponse {
  statusCode: number;
  status:     string;
  found:      boolean;
  count:      number;
  totalCount: number;
  page:       number;
  limit:      number;
  totalPages: number;
  data:       ShowcaseItem[];
}

// ─── Mapped shape (spread onto <ProductCard>) ─────────────────────────────────

export interface ShowcaseProduct {
  productUuid:      string;
  title:            string;
  slug:             string;
  price:            number;
  originalPrice:    number;
  discount:         number;
  badge:            string;
  isBestDeal:       boolean;
  inStock:          boolean;
  isTba:            boolean;
  image:            string;
  endOfLife:        boolean;
  allowPreOrder:    boolean;
  recognitionBadge: string;
}

export interface ShowcaseFetchResult {
  products:   ShowcaseProduct[];
  totalPages: number;
  totalCount: number;
}

// ─── Mapper — used by both SSR and client-side infinite scroll ────────────────

export function mapShowcaseItems(list: ShowcaseItem[]): ShowcaseProduct[] {
  const mapped = list.map((item): ShowcaseProduct => ({
    productUuid:      item.productUuid,
    title:            item.productName,
    slug:             item.productSlug,
    price:            item.discountedPrice,
    originalPrice:    item.regularPrice,
    discount:         Math.round(item.disRate ?? 0),
    badge:            item.productBadge ?? "",
    isBestDeal:       false,
    inStock:          !item.isTba,
    isTba:            item.isTba,
    image:            item.thumbnails?.mediaFileUrl ?? "",
    endOfLife:        item.endOfLife        ?? false,
    allowPreOrder:    item.allowPreOrder    ?? false,
    recognitionBadge: item.recognitionBadge ?? "",
  }));
  return sortInStockFirst(mapped);
}

// ─── SSR fetcher ──────────────────────────────────────────────────────────────

/**
 * @param showcaseSlug  e.g. "hot-deal" | "feature-products"
 * @param page          1-based page number (default 1)
 * @param limit         items per page (default 50)
 * @param revalidate    ISR revalidation in seconds (default 60)
 */
export async function fetchShowcaseProducts(
  showcaseSlug: string,
  page         = 1,
  limit        = 50,
  revalidate   = 60,
): Promise<ShowcaseFetchResult> {
  try {
    const res = await api.get<ShowcaseItemsResponse>(
      `/showcase-items?showcaseSlug=${encodeURIComponent(showcaseSlug)}&page=${page}&limit=${limit}`,
      { next: { revalidate } },
    );
    const list: ShowcaseItem[] = Array.isArray(res?.data) ? res.data : [];
    return {
      products:   mapShowcaseItems(list),
      totalPages: res?.totalPages ?? 1,
      totalCount: res?.totalCount ?? list.length,
    };
  } catch (err) {
    console.error(`[fetchShowcaseProducts] slug="${showcaseSlug}" failed:`, err);
    return { products: [], totalPages: 1, totalCount: 0 };
  }
}
