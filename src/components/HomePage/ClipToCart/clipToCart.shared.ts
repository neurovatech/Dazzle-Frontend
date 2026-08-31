/**
 * Shapes and helpers shared by the /clip-to-cart page (server) and the grid
 * component (client).
 *
 * Kept in its own module — with no "use client" — precisely because BOTH sides
 * need it: the page maps the first page during SSR, and the component maps each
 * further page it pulls in while scrolling. One mapper means the two can't drift.
 */

export interface ClipApiProduct {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  brandName?: string;
  brandLogo?: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string } | null;
  clipInfo?: { clipThumbnail: string; clipUrl: string };
}

export interface ClipApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ClipApiProduct[];
}

/** A card's worth of data, already mapped out of the API shape. */
export interface ClipProduct {
  id: string;
  title: string;
  image: string;
  productSlug: string;
  brandName?: string;
  brandLogo?: string;
  videoUrl?: string;
  clipThumbnail?: string;
  regularPrice?: number;
  discountedPrice?: number;
}

/** Items loaded per scroll step. */
export const CLIP_PAGE_SIZE = 10;

export function clipEndpoint(page: number): string {
  return `/showcase-items?showcaseSlug=clip-to-cart&page=${page}&limit=${CLIP_PAGE_SIZE}`;
}

export function mapClipProduct(item: ClipApiProduct): ClipProduct {
  return {
    id: item.productUuid,
    title: item.productName,
    productSlug: item.productSlug,
    brandName: item.brandName,
    brandLogo: item.brandLogo,
    image: item.thumbnails?.mediaFileUrl ?? "",
    videoUrl: item.clipInfo?.clipUrl,
    clipThumbnail: item.clipInfo?.clipThumbnail,
    regularPrice: item.regularPrice,
    discountedPrice: item.discountedPrice,
  };
}

// ─── Small shared formatters ──────────────────────────────────────────────────

export const isEmpty = (v: string | null | undefined) => !v || v.trim() === "";

export const formatPrice = (v?: number) =>
  typeof v === "number" ? `৳${v.toLocaleString("en-BD")}` : undefined;

/**
 * Reel aspect ratio — the shape the modal reserves for a clip.
 *
 * 9:16 is the vertical-video standard every phone camera and editing app already
 * exports, so clips fill the frame with no letterboxing. The modal derives its
 * width from its height using this, which is what keeps the reel centred at any
 * viewport size without ever needing to scroll.
 */
export const REEL_ASPECT_W = 9;
export const REEL_ASPECT_H = 16;
