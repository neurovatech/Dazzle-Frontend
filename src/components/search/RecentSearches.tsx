/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "@/icon";
import { api } from "@/lib/api";

// ── localStorage key ────────────────────────────────────────────────
const STORAGE_KEY = "dazzle_recent_searches";
const MAX_RECENTS = 8;

// ── Trending API types ──────────────────────────────────────────────
interface TrendingDocument {
  id: string;
  productName: string;
  productSlug: string;
  productBadge?: string;
  categoryName: string;
  categorySlug: string;
  thumbnailsUrl: string;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  isStockAvailable: boolean;
}

interface TrendingHit {
  document: TrendingDocument;
}

interface TrendingApiResponse {
  found: number;
  hits: TrendingHit[];
}

// ── Helpers ─────────────────────────────────────────────────────────
function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecents(items: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Call this from SearchBar when user submits / selects a term */
export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const prev = loadRecents().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
  saveRecents([trimmed, ...prev].slice(0, MAX_RECENTS));
}

// ── Props ───────────────────────────────────────────────────────────
interface RecentSearchesProps {
  onSelectTerm?: (term: string) => void;
}

export default function RecentSearches({ onSelectTerm }: RecentSearchesProps) {
  const [recents, setRecents] = useState<string[]>([]);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  // ── Trending Searches API ──────────────────────────────────────
  const { data: trendingData, isLoading: trendingLoading } =
    useQuery<TrendingApiResponse>({
      queryKey: ["trending-search"],
      queryFn: () =>
        api.get<TrendingApiResponse>("/trending/search?page=1&perPage=10"),
      staleTime: 10 * 60 * 1000, // 10 min
    });

  const trendingProducts = trendingData?.hits ?? [];

  // ── Recent search handlers ─────────────────────────────────────
  const removeRecent = (index: number) => {
    const updated = recents.filter((_, i) => i !== index);
    setRecents(updated);
    saveRecents(updated);
  };

  const clearAll = () => {
    setRecents([]);
    saveRecents([]);
  };

  const handleSelectRecent = (term: string) => {
    addRecentSearch(term);          // bubble it to top
    setRecents(loadRecents());
    onSelectTerm?.(term);
  };

  const handleSelectTrending = (product: TrendingDocument) => {
    addRecentSearch(product.productName);
    setRecents(loadRecents());
    onSelectTerm?.(product.productName);
  };

  const formatPrice = (p: number) => `৳${p.toLocaleString("en-BD")}`;

  return (
    <div className="flex flex-col lg:flex-row lg:divide-x divide-gray-100 dark:divide-gray-700">

      {/* ── 1. Recent Searches ── */}
      <div className="w-full lg:w-[220px] xl:w-[260px] shrink-0 p-4 lg:p-5 border-b lg:border-b-0 border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            Recent Searches
          </span>
          {recents.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-400 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <ul className="space-y-0.5">
          {recents.length === 0 && (
            <li className="text-xs text-gray-400 dark:text-gray-500 py-2">
              No recent searches
            </li>
          )}
          {recents.map((term, i) => (
            <li
              key={i}
              onClick={() => handleSelectRecent(term)}
              className="flex items-center justify-between group/item py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 text-gray-400">
                  <SearchIcon />
                </span>
                <span className="text-sm text-gray-600 dark:text-white truncate">
                  {term}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecent(i);
                }}
                className="ml-2 shrink-0 text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity text-sm leading-none"
                aria-label="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 2. Trending Searches ── */}
      <div className="flex-1 p-4 lg:p-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
          Trending Searches
        </p>

        {/* Loading skeletons */}
        {trendingLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending product cards */}
        {!trendingLoading && trendingProducts.length === 0 && (
          <p className="text-xs text-gray-400">No trending products</p>
        )}

        {!trendingLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {trendingProducts.map(({ document: product }) => (
              <Link
                key={product.id}
                href={`/product/${product.productSlug}`}
                onClick={() => {
                  addRecentSearch(product.productName);
                  setRecents(loadRecents());
                }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group/prod border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src={product.thumbnailsUrl || "/images/no_images.png"}
                    alt={product.productName}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 dark:text-white font-medium truncate group-hover/prod:text-[#b8864e] transition-colors leading-snug">
                    {product.productName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-800 dark:text-white">
                      {formatPrice(product.discountedPrice)}
                    </span>
                    {product.regularPrice > product.discountedPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                    {product.disRate > 0 && (
                      <span className="text-[10px] font-bold text-red-500">
                        -{Math.round(product.disRate)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock badge */}
                <span
                  className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    product.isStockAvailable
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {product.isStockAvailable ? "In Stock" : "Out"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
