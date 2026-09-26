"use client";

/**
 * BrandShowcaseSections
 *
 * Fetches /showcase-escalate/{brandSlug}?brand=1 which returns:
 *   { data: { topselling: [...], trending: [...] } }
 *
 * Renders two sections:
 *   1. Top Selling  — same visual as TopSellingCom  (grey bg)
 *   2. Trending     — same visual as RunningOfferCom (brown bg)
 *
 * Both are hidden when empty.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import TrendingNow from "@/components/HomePage/TrendingNow/TrendingNow";
import type { ProductCardItem } from "@/components/HomePage/TrendingNow/TrendingNowSectionCom";

// ─── API shape ────────────────────────────────────────────────────────────────

interface ShowcaseProduct {
  productUuid: string;
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

interface BrandShowcaseResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: {
    topSelling: ShowcaseProduct[];
    trending:   ShowcaseProduct[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapToCards(items: ShowcaseProduct[]): ProductCardItem[] {
  return items.map((item) => ({
    uuid:          item.productUuid,
    title:         item.productName,
    slug:          item.productSlug,
    price:         item.discountedPrice,
    originalPrice: item.regularPrice,
    discount:      Math.round(item.disRate ?? 0),
    badge:         item.productBadge,
    isBestDeal:    false,
    inStock:       !item.isTba,
    image:         item.thumbnails?.mediaFileUrl ?? "",
    isTba:            item.isTba,
    endOfLife:        item.endOfLife        ?? false,
    allowPreOrder:    item.allowPreOrder    ?? false,
    recognitionBadge: item.recognitionBadge ?? "",
  }));
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 pb-[30px]">
      {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`animate-pulse bg-gray-200 dark:bg-[#3a3330] rounded-2xl h-[372px] md:h-[404px] ${i >= 2 ? "hidden lg:block" : ""}`} />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  brandSlug: string;
  /**
   * The chip/tab row on the brand page — these are sub-category slugs
   * (e.g. "iphone", "mac-mini"), so they're sent as subCategory=1, verified
   * against the live API: showcase-escalate/iphone?subCategory=1 finds real
   * results, the same slug with ?category=1 finds nothing ("iphone" is
   * registered as a sub-category, not a top-level one).
   */
  activeCategory?: string | null;
  /**
   * Top-level category the visitor arrived from (?fromCategory=phones from the
   * mega-menu) — same value BrandProductListClient uses for the main grid.
   * This one genuinely is a top-level category slug, so it's sent as
   * category=1, distinct from the chip row above.
   *
   * showcase-escalate has no combined brand+category filter (verified against
   * the live API: passing a second filter alongside brand=1 is silently
   * ignored, and brand=1 with another scope flag together is a 400), so
   * whenever a category or sub-category is in play — chip or arrived-from —
   * these two sections show that CATEGORY's top selling/trending across all
   * brands rather than this brand's alone; only with neither active do they
   * stay brand-only.
   */
  topCategory?: string | null;
}

export default function BrandShowcaseSections({ brandSlug, activeCategory, topCategory }: Props) {
  const chipSlug = activeCategory?.trim() || null;
  const topSlug  = topCategory?.trim() || null;

  let showcaseSlug: string;
  let showcaseParam: "subCategory" | "category" | "brand";

  if (chipSlug) {
    showcaseSlug = chipSlug;
    showcaseParam = "subCategory";
  } else if (topSlug) {
    showcaseSlug = topSlug;
    showcaseParam = "category";
  } else {
    showcaseSlug = brandSlug;
    showcaseParam = "brand";
  }

  const { data, isLoading } = useQuery<BrandShowcaseResponse>({
    queryKey: ["brand-showcase", showcaseSlug, showcaseParam],
    queryFn: () =>
      api.get<BrandShowcaseResponse>(
        `/showcase-escalate/${showcaseSlug}?${showcaseParam}=1`,
      ),
    staleTime: 10 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:   false,
  });
  const topSelling = mapToCards(data?.data?.topSelling ?? []);
  const trending   = mapToCards(data?.data?.trending   ?? []);

  const hasTopSelling = topSelling.length > 0;
  const hasTrending   = trending.length   > 0;

  // Both empty and not loading → render nothing
  if (!isLoading && !hasTopSelling && !hasTrending) return null;

  return (
    <div>
      {/* ── Top Selling ── */}
      {(isLoading || hasTopSelling) && (
        <div className="bg-[#EEEEEE] dark:bg-[#2a2420] rounded-lg py-3 px-3 mb-6">
          <div className="flex pb-4 md:px-4">
            <h2 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
              Top Selling
            </h2>
          </div>
          {isLoading && !hasTopSelling ? (
            <SkeletonRow />
          ) : (
            <TrendingNow products={topSelling} />
          )}
        </div>
      )}

      {/* ── Trending ── */}
      {(isLoading || hasTrending) && (
        <div className="bg-[#6D3F0E] dark:bg-[#2a2420] rounded-lg py-3 px-2 mb-6">
          <div className="flex pb-4 md:px-4">
            <h2 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold bg-linear-to-r from-white to-[#CB843B] bg-clip-text text-transparent">
              Trending
            </h2>
          </div>
          {isLoading && !hasTrending ? (
            <SkeletonRow />
          ) : (
            <TrendingNow products={trending} />
          )}
        </div>
      )}
    </div>
  );
}
