"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/share/GlobalProductCard";
import ProductGridSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import CountdownBadges from "./CountdownBadges";
import NoImg from "@/images/no_images.png";
import type { CampaignDetailResponse, CampaignProduct } from "@/app/(public)/offer/[slug]/page";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://apix.bigpoint.com.bd";
const LIMIT = 10;

// ─── Pagination ───────────────────────────────────────────────────────────────

// function Pagination({ page, totalPages, onPageChange }: {
//   page: number; totalPages: number; onPageChange: (p: number) => void;
// }) {
//   if (totalPages <= 1) return null;

//   const getPages = (): (number | "...")[] => {
//     const pages: (number | "...")[] = [];
//     const delta = 2;
//     const left  = Math.max(1, page - delta);
//     const right = Math.min(totalPages, page + delta);
//     if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
//     for (let i = left; i <= right; i++) pages.push(i);
//     if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
//     return pages;
//   };

//   return (
//     <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
//       <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
//         className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
//       >
//         <ChevronLeft size={16} />
//       </button>
//       {getPages().map((p, i) =>
//         p === "..." ? (
//           <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">…</span>
//         ) : (
//           <button key={p} onClick={() => onPageChange(p as number)}
//             className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
//               p === page
//                 ? "bg-[#6D3F0E] text-white"
//                 : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
//             }`}
//           >{p}</button>
//         )
//       )}
//       <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
//         className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
//       >
//         <ChevronRight size={16} />
//       </button>
//     </div>
//   );
// }

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  slug: string; // resolved UUID/ID from SSR — never needs fallback
  initialData: CampaignDetailResponse;
  campaignName: string;
  campaignDescription?: string;
  campaignImage?: string;
  endedAt?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignDetailClient({
  slug,
  initialData,
  campaignName,
  campaignDescription,
  campaignImage,
  endedAt,
}: Props) {
  // ── Infinite scroll state ─────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<CampaignProduct[]>(initialData?.data ?? []);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState((initialData?.totalPages ?? 1) > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [showFilter, setShowFilter]   = useState(false);
  const [minPrice, setMinPrice]       = useState("");
  const [maxPrice, setMaxPrice]       = useState("");
  const [stockStatus, setStockStatus] = useState<"" | "0" | "1">("");
  const [appliedMin, setAppliedMin]     = useState("");
  const [appliedMax, setAppliedMax]     = useState("");
  const [appliedStock, setAppliedStock] = useState<"" | "0" | "1">("");

  const hasActiveFilter = !!(appliedMin || appliedMax || appliedStock);
  const totalCount = initialData?.totalCount ?? allProducts.length;

  // Reset when filters change
  useEffect(() => {
    setAllProducts(initialData?.data ?? []);
    setPage(1);
    setHasMore((initialData?.totalPages ?? 1) > 1);
  }, [appliedMin, appliedMax, appliedStock]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(LIMIT) });
      if (appliedMin)   params.set("minDiscountedPrice", appliedMin);
      if (appliedMax)   params.set("maxDiscountedPrice", appliedMax);
      if (appliedStock) params.set("stockStatus", appliedStock);
      const res = await api.get<CampaignDetailResponse>(`campaign/${slug}?${params.toString()}`);
      const newItems = res?.data ?? [];
      if (newItems.length > 0) {
        setAllProducts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? 1));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[CampaignDetailClient] infinite scroll error:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, slug, appliedMin, appliedMax, appliedStock]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchNextPage, hasMore, isFetchingMore]);

  // Apply filters — refetch from page 1
  const handleApply = async () => {
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setAppliedStock(stockStatus);
    setShowFilter(false);
    // fetch page 1 with new filters
    setIsFetchingMore(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: String(LIMIT) });
      if (minPrice)   params.set("minDiscountedPrice", minPrice);
      if (maxPrice)   params.set("maxDiscountedPrice", maxPrice);
      if (stockStatus) params.set("stockStatus", stockStatus);
      const res = await api.get<CampaignDetailResponse>(`campaign/${slug}?${params.toString()}`);
      setAllProducts(res?.data ?? []);
      setPage(1);
      setHasMore((res?.totalPages ?? 1) > 1);
    } catch (err) {
      console.error("[CampaignDetailClient] filter fetch error:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleClear = () => {
    setMinPrice(""); setMaxPrice(""); setStockStatus("");
    setAppliedMin(""); setAppliedMax(""); setAppliedStock("");
    setAllProducts(initialData?.data ?? []);
    setPage(1);
    setHasMore((initialData?.totalPages ?? 1) > 1);
  };

  const endDate  = endedAt ? new Date(endedAt) : undefined;
  const bannerSrc = (() => {
    if (!campaignImage) return null;
    return campaignImage.startsWith("http")
      ? campaignImage
      : `${BASE_URL}${campaignImage.startsWith("/") ? "" : "/"}${campaignImage}`;
  })();

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-2">
        {campaignName}
      </h2>

      {/* Banner */}
      {bannerSrc && (
        <div className="w-full mb-8 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerSrc} alt={campaignName}
            className="w-full h-auto object-cover max-h-72"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
          />
        </div>
      )}

      {/* Countdown + Filter row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#101518] dark:text-white text-sm font-medium">Offer Ending In</span>
          {endDate && endDate > new Date() && <CountdownBadges size="md" endDate={endDate} />}
        </div>

        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`flex items-center gap-1.5 text-sm rounded-[10px] py-1.5 px-3 border transition-colors ${
            hasActiveFilter
              ? "border-[#6D3F0E] text-[#6D3F0E] bg-[#6D3F0E]/5"
              : "border-[#EEEEEE] dark:border-white/10 text-gray-700 dark:text-white"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filter {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#6D3F0E] inline-block" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-gray-100 dark:border-white/10 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Min Price (৳)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Max Price (৳)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Stock Status</label>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as "" | "0" | "1")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition appearance-none cursor-pointer"
              >
                <option value="">All</option>
                <option value="1">In Stock</option>
                <option value="0">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleClear}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >Clear</button>
            <button onClick={handleApply}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
            >Apply Filters</button>
          </div>
        </div>
      )}

      {/* Description */}
      {campaignDescription && (
        <div className="bg-amber-50 dark:bg-[#1A1A1A] border border-amber-100 dark:border-gray-700 rounded-xl p-5 mb-8">
          <p className="text-[#222222] dark:text-gray-200 leading-7 text-sm">{campaignDescription}</p>
        </div>
      )}

      {/* Count */}
      {totalCount > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          {totalCount.toLocaleString()} products found
          {hasActiveFilter && (
            <button onClick={handleClear} className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* ── Empty ── */}
      {allProducts.length === 0 && !isFetchingMore && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No products found for this offer.</p>
          {hasActiveFilter && (
            <button onClick={handleClear} className="mt-2 text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {allProducts.length > 0 && (
        <div className="grid md:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-3">
          {allProducts.map((product: CampaignProduct, i: number) => {
            const imgSrc = product.thumbnails?.mediaFileUrl || NoImg.src;
            const price  = product.discountedPrice || product.regularPrice || 0;
            return (
              <ProductCard
                key={`${product.productUuid}-${i}`}
                productUuid={product.productUuid}
                image={imgSrc}
                title={product.productName}
                price={price}
                originalPrice={product.regularPrice || 0}
                discount={product.disRate || 0}
                badge={product.productBadge || undefined}
                inStock={!product.isTba}
                isTba={product.isTba}
                isBestDeal={false}
                slug={product.productSlug || product.productUuid}
              />
            );
          })}
        </div>
      )}

      {/* Loader trigger */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* Loading more */}
      {isFetchingMore && <ProductGridSkeleton count={LIMIT} cols="4" />}

      {/* All loaded */}
      {/* {!hasMore && allProducts.length > 0 && !isFetchingMore && (
        <p className="text-center text-xs text-gray-400 py-6">
          ✅ সব {allProducts.length.toLocaleString()} টি পণ্য দেখানো হয়েছে
        </p>
      )} */}
    </div>
  );
}
