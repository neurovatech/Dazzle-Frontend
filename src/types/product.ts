/**
 * Shared product types used across all API endpoints and components.
 *
 * Single source of truth — import from here instead of re-declaring
 * identical shapes in every SectionCom / page file.
 */

// ─── Raw API shape (common across /products, /showcase-items, /campaign, /showcase-escalate) ─────

export interface ApiProductItem {
  productUuid: string;
  productCode?: string;
  productName: string;
  productSlug: string;
  productBadge?: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails?: { fileUuid?: string; mediaFileUrl?: string } | { mediaFile?: string }[] | null;
  // ── Lifecycle / ordering flags ──────────────────────────────────────────────
  /** Product is discontinued — no restock planned. Buttons disabled when true. */
  endOfLife?: boolean;
  /** Pre-order eligible — can be reserved before in-stock. */
  allowPreOrder?: boolean;
  /** Recognition badge from CMS (e.g. "Editor's Choice", "Award Winner"). */
  recognitionBadge?: string;
}

// ─── Intermediate DTO — used by all SectionComs ────────────────────────────────

/** Normalised shape passed to GlobalProductCard from every listing component. */
export interface ProductCardItem {
  uuid: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  isBestDeal: boolean;
  inStock: boolean;
  isTba?: boolean;
  image: string;
  minBookingPrice?: number;
  // ── Lifecycle / ordering ───────────────────────────────────────────────────
  endOfLife?: boolean;
  allowPreOrder?: boolean;
  recognitionBadge?: string;
}

// ─── Helper: map raw API item → ProductCardItem ────────────────────────────────

export function mapApiProductToCard(
  item: ApiProductItem,
  overrides?: Partial<ProductCardItem>,
): ProductCardItem {
  const thumbUrl =
    item.thumbnails && !Array.isArray(item.thumbnails)
      ? (item.thumbnails as { mediaFileUrl?: string }).mediaFileUrl ?? ""
      : "";

  return {
    uuid:             item.productUuid,
    title:            item.productName,
    slug:             item.productSlug,
    price:            item.discountedPrice,
    originalPrice:    item.regularPrice,
    discount:         Math.round(item.disRate ?? 0),
    badge:            item.productBadge ?? "",
    isBestDeal:       false,
    inStock:          !item.isTba,
    isTba:            item.isTba,
    image:            thumbUrl,
    endOfLife:        item.endOfLife  ?? false,
    allowPreOrder:    item.allowPreOrder ?? false,
    recognitionBadge: item.recognitionBadge ?? "",
    ...overrides,
  };
}
