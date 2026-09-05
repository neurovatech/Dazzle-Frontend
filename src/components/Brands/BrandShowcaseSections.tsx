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
  brandSlug: string;
  /** When a category chip is active, call the API with that slug instead */
  activeCategory?: string | null;
}

export default function BrandShowcaseSections({ brandSlug, activeCategory }: Props) {
  // Use activeCategory slug when selected, otherwise fall back to brandSlug
  const showcaseSlug = activeCategory?.trim() || brandSlug;

  const { data, isLoading } = useQuery<BrandShowcaseResponse>({
    queryKey: ["brand-showcase", showcaseSlug],
    queryFn: () =>
      api.get<BrandShowcaseResponse>(
        `/showcase-escalate/${showcaseSlug}?brand=1`,
        { cache: "no-store" },
      ),
    staleTime: 10 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:   false,
  });

  console.log(`/showcase-escalate/${showcaseSlug}?brand=1`, "99999")

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
