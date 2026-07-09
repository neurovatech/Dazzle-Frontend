"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/share/GlobalProductCard";
import CountdownBadges from "./CountdownBadges";
import NoImg from "@/images/no_images.png";
import type { CampaignDetailResponse, CampaignProduct } from "@/app/(public)/offer/[slug]/page";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://apix.bigpoint.com.bd";

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#6D3F0E] text-white"
                : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  slug: string;
  initialData: CampaignDetailResponse;
  campaignName: string;
  campaignDescription?: string;
  campaignImage?: string;
  endedAt?: string;
}

const LIMIT = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignDetailClient({
  slug,
  initialData,
  campaignName,
  campaignDescription,
  campaignImage,
  endedAt,
}: Props) {
  const [page, setPage]             = useState(1);
  const [stockStatus, setStockStatus] = useState<"" | "0" | "1">("");
  const [minPrice, setMinPrice]     = useState("");
  const [maxPrice, setMaxPrice]     = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // applied filters (only update on Apply click)
  const [appliedMin, setAppliedMin]     = useState("");
  const [appliedMax, setAppliedMax]     = useState("");
  const [appliedStock, setAppliedStock] = useState<"" | "0" | "1">("");

  const { data, isLoading, isError } = useQuery<CampaignDetailResponse>({
    queryKey: ["campaign", slug, page, appliedMin, appliedMax, appliedStock],
    queryFn: () => {
      const params: Record<string, string> = {
        page:  String(page),
        limit: String(LIMIT),
      };
      if (appliedMin)   params.minDiscountedPrice = appliedMin;
      if (appliedMax)   params.maxDiscountedPrice = appliedMax;
      if (appliedStock) params.stockStatus        = appliedStock;

      return api.get<CampaignDetailResponse>(`campaign/${slug}`, { params });
    },
    placeholderData: (prev) => prev ?? initialData,
    initialData: page === 1 && !appliedMin && !appliedMax && !appliedStock
      ? initialData
      : undefined,
  });

  const products    = data?.data ?? [];
  const totalPages  = data?.totalPages ?? 1;
  const totalCount  = data?.totalCount ?? 0;
  const endDate     = endedAt ? new Date(endedAt) : undefined;

  const bannerSrc = (() => {
    if (!campaignImage) return null;
    if (campaignImage.startsWith("http")) return campaignImage;
    return `${BASE_URL}${campaignImage.startsWith("/") ? "" : "/"}${campaignImage}`;
  })();

  const handleApplyFilter = () => {
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setAppliedStock(stockStatus);
    setPage(1);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    setMinPrice(""); setMaxPrice(""); setStockStatus("");
    setAppliedMin(""); setAppliedMax(""); setAppliedStock("");
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilter = !!(appliedMin || appliedMax || appliedStock);

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
          <img
            src={bannerSrc}
            alt={campaignName}
            className="w-full h-auto object-cover max-h-72"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
          />
        </div>
      )}

      {/* Countdown + Filter row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#101518] dark:text-white text-sm font-medium">
            Offer Ending In
          </span>
          {endDate && endDate > new Date() && (
            <CountdownBadges size="md" endDate={endDate} />
          )}
        </div>

        {/* Filter toggle */}
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
            {/* Min price */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Min Price (৳)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition"
              />
            </div>
            {/* Max price */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Max Price (৳)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition"
              />
            </div>
            {/* Stock status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as "" | "0" | "1")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#6D3F0E]/30 transition appearance-none cursor-pointer"
              >
                <option value="">All</option>
                <option value="1">In Stock</option>
                <option value="0">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClearFilter}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilter}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      {campaignDescription && (
        <div className="bg-amber-50 dark:bg-[#1A1A1A] border border-amber-100 dark:border-gray-700 rounded-xl p-5 mb-8">
          <p className="text-[#222222] dark:text-gray-200 leading-7 text-sm">
            {campaignDescription}
          </p>
        </div>
      )}

      {/* Product count */}
      {!isLoading && totalCount > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          {totalCount.toLocaleString()} products found
          {hasActiveFilter && (
            <button onClick={handleClearFilter} className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* ── States ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-[#6D3F0E] dark:text-[#d4a97a]" />
          <p className="text-sm text-gray-400">Loading products...</p>
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500 text-center py-10">
          Failed to load products. Please try again.
        </p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No products found for this campaign.</p>
          {hasActiveFilter && (
            <button
              onClick={handleClearFilter}
              className="mt-2 text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      {!isLoading && !isError && products.length > 0 && (
        <>
          <div className="grid md:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-3">
            {products.map((product: CampaignProduct) => {
              const imgSrc = product.thumbnails?.mediaFileUrl || NoImg.src;
              const price  = product.discountedPrice || product.regularPrice || 0;

              return (
                <ProductCard
                  key={product.productUuid}
                  image={imgSrc}
                  title={product.productName}
                  price={price}
                  originalPrice={product.regularPrice || 0}
                  discount={product.disRate || 0}
                  badge={product.productBadge || undefined}
                  inStock={!product.isTba}
                  isBestDeal={product.disRate > 0}
                  slug={product.productSlug || product.productUuid}
                />
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

          <p className="text-center text-xs text-gray-400 mt-3">
            Page {page} of {totalPages} — showing {products.length} of {totalCount.toLocaleString()} products
          </p>
        </>
      )}
    </div>
  );
}
