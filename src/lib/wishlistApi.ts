import { api } from "@/lib/api";

// ─── Add ────────────────────────────────────────────────────────────────────

export interface WishlistAddPayload {
  productUuid: string;
  variantUuid: string;
}

export interface WishlistAddResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: { wishListUuid: string };
  errors?: string[];
}

export function addToWishlistApi(payload: WishlistAddPayload) {
  return api.post<WishlistAddResponse>("/api/tokenized/v1/wishlist-add", payload);
}

// ─── Get ────────────────────────────────────────────────────────────────────

export interface WishlistProduct {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  endOfLife?: boolean;
  allowPreOrder?: boolean;
  recognitionBadge?: string;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string } | null;
}

export interface WishlistGetResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: WishlistProduct[];
  message?: string;
}

export function getWishlistApi(
  params: { page?: number; limit?: number; order?: string } = {},
) {
  return api.get<WishlistGetResponse>("/api/tokenized/v1/wishlist-get", {
    params: {
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      order: params.order ?? "new",
    },
  });
}

// ─── Remove ─────────────────────────────────────────────────────────────────

export interface WishlistRemoveResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  errors?: string[];
}

/**
 * Identified by `wishListUuid` — the wishlist ENTRY's own id, not the
 * product's — returned in addToWishlistApi's response as `data.wishListUuid`.
 * GET /wishlist-get does not currently echo this id back per item, so an
 * item synced from that list (rather than just added in this session) has
 * no id to delete by yet — see useWishlist's removeFromWishlist for how that
 * gap is handled.
 */
export function removeFromWishlistApi(wishListUuid: string) {
  return api.delete<WishlistRemoveResponse>("/api/tokenized/v1/wishlist-remove", {
    wishListUuid,
  });
}
