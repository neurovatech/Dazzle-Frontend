import { api } from "@/lib/api";
import { sortInStockFirst } from "@/lib/sortProducts";

// ─── Raw API shape ────────────────────────────────────────────────────────────

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

interface ShowcaseItem {
  productUuid:     string;
  productCode?:    string;
  productName:     string;
  productSlug:     string;
  productBadge:    string;
  isTba:           boolean;
  regularPrice:    number;
  discountedPrice: number;
  disRate:         number;
  thumbnails:      ShowcaseThumbnail | null;
  // lifecycle flags
  endOfLife?:        boolean;
  allowPreOrder?:    boolean;
  recognitionBadge?: string;
}

interface ShowcaseItemsResponse {
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

// ─── Mapped shape (passed directly to <ProductCard>) ─────────────────────────

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

// ─── Fetcher ──────────────────────────────────────────────────────────────────

/**
 * @param showcaseSlug  e.g. "hot-deal" | "feature-products" | "trending-now"
 * @param revalidate    ISR revalidation seconds (default 60)
 */
export async function showcaseProducts(
  showcaseSlug: string,
  revalidate = 5,
): Promise<ShowcaseProduct[]> {
  try {
    const res = await api.get<ShowcaseItemsResponse>(
      `/showcase-items?showcaseSlug=${encodeURIComponent(showcaseSlug)}`,
      { next: { revalidate } },
    );

    const list: ShowcaseItem[] = Array.isArray(res?.data) ? res.data : [];

    const mapped: ShowcaseProduct[] = list.map((item) => ({
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

    // In-stock products first, out-of-stock last
    return sortInStockFirst(mapped.map((p) => ({ ...p, isTba: p.isTba })));
  } catch (error) {
    console.error(`[fetchShowcaseProducts] slug="${showcaseSlug}" failed:`, error);
    return [];
  }
}
