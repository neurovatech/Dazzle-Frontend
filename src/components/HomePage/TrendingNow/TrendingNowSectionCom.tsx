"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TrendingNow from "./TrendingNow";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

interface ShowcaseItem {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: ShowcaseThumbnail;
}

interface ShowcaseItemsResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ShowcaseItem[];
}

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
  image: string;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { label: "Newest",  slug: "trending-now-newest"  },
  { label: "Popular", slug: "trending-now-popular" },
] as const;

type TabSlug = typeof TABS[number]["slug"];

// ─── Map API response → ProductCardItem[] ─────────────────────────────────────

function mapItems(data: ShowcaseItem[]): ProductCardItem[] {
  return data.map((item) => ({
    uuid:          item.productUuid,
    title:         item.productName,
    slug:          item.productSlug,
    price:         item.discountedPrice,
    originalPrice: item.regularPrice,
    discount:      Math.round(item.disRate),
    badge:         item.productBadge,
    isBestDeal:    item.disRate > 15,
    inStock:       !item.isTba,
    image:         item.thumbnails?.mediaFileUrl ?? "/images/product.png",
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrendingNowSectionCom() {
  const [activeSlug, setActiveSlug] = useState<TabSlug>("trending-now-newest");

  const { data, isLoading } = useQuery<ProductCardItem[]>({
    queryKey: ["trending-now", activeSlug],
    queryFn: async () => {
      const res = await api.get<ShowcaseItemsResponse>(
        `/showcase-items?showcaseSlug=${activeSlug}`,
        { cache: "no-store" }
      );
      return mapItems(Array.isArray(res?.data) ? res.data : []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data ?? [];

  console.log(data, "productsproductsproducts")

  return (
    <div className="w-full">
      {/* ── Tab buttons ── */}
      <div className="flex flex-wrap gap-2 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActiveSlug(tab.slug)}
            className={`px-4 py-2 lg:text-sm text-[13px] md:text-base font-bold rounded-lg transition-all duration-300 ${
              activeSlug === tab.slug
                ? "bg-[#e9ccae7a] text-primary"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-2xl h-[220px]"
              />
            ))}
          </div>
        ) : (
          <TrendingNow products={products} />
        )}
      </div>
    </div>
  );
}
