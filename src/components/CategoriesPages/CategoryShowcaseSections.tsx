"use client";

/**
 * CategoryShowcaseSections
 *
 * Fetches /showcase-escalate/{categorySlug}?category=1
 * Response: { data: { topselling: [...], trending: [...] } }
 *
 * Renders two sections above the product list:
 *   1. Top Selling  (grey bg)
 *   2. Trending     (brown bg)
 *
 * Same visual style as TopSellingCom / RunningOfferCom.
 * Hidden when both sections are empty.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import TrendingNow from "@/components/HomePage/TrendingNow/TrendingNow";
import type { ProductCardItem } from "@/components/HomePage/TrendingNow/TrendingNowSectionCom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowcaseProduct {
  productUuid:     string;
  productName:     string;
  productSlug:     string;
  productBadge:    string;
  isTba:           boolean;
  regularPrice:    number;
  discountedPrice: number;
  disRate:         number;
  thumbnails: { fileUuid: string; mediaFileUrl: string } | null;
}

interface CategoryShowcaseResponse {
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
  }));
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 dark:bg-[#3a3330] rounded-2xl h-[220px]" />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  categorySlug: string;
  /** Query param name: "category" for category page, "subCategory" for subcategory page */
  queryParam?: "category" | "subCategory";
  /** When a brand chip is active, call the API with that brand slug + brand=1 instead */
  activeBrandSlug?: string | null;
}

export default function CategoryShowcaseSections({
  categorySlug,
  queryParam = "category",
  activeBrandSlug,
}: Props) {
  // Brand chip selected → use brand slug with brand=1
  // Otherwise → use category/subCategory slug with the appropriate param
  const showcaseSlug  = activeBrandSlug?.trim() || categorySlug;
  const showcaseParam = activeBrandSlug?.trim() ? "brand" : queryParam;

  const { data, isLoading } = useQuery<CategoryShowcaseResponse>({
    queryKey: ["category-showcase", showcaseSlug, showcaseParam],
    queryFn: () =>
      api.get<CategoryShowcaseResponse>(
        `/showcase-escalate/${showcaseSlug}?${showcaseParam}=1`,
        { cache: "no-store" },
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
