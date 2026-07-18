"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { addRecentSearch } from "@/components/search/RecentSearches";
import { SearchIcon } from "@/icon";
import NoImg from "@/images/no_images.png";

// ── API types ──────────────────────────────────────────────────────
interface ProductDocument {
  id: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  categorySlug: string;
  thumbnailsUrl: string;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  isStockAvailable: boolean;
}

interface SearchApiResponse {
  found: number;
  hits: { document: ProductDocument }[];
}

// ── Skeleton ───────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get("q") ?? "";
  const [inputVal, setInputVal] = useState(keyword);

  // Sync input when URL changes
  useEffect(() => {
    setInputVal(keyword);
  }, [keyword]);

  const { data, isLoading, isError } = useQuery<SearchApiResponse>({
    queryKey: ["search-page", keyword],
    queryFn: () =>
      api.get<SearchApiResponse>(
        `/product/search?keyword=${encodeURIComponent(keyword)}&page=1&perPage=40`
      ),
    enabled: !!keyword,
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.hits ?? [];
  const total = data?.found ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = inputVal.trim();
    if (!term) return;
    addRecentSearch(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const formatPrice = (p: number) => `৳${p.toLocaleString("en-BD")}`;

  return (
    <div className="max-w-350 mx-auto px-4 py-8">
      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search for the item"
            className="w-full bg-white dark:bg-[#2e2b28] dark:text-white text-gray-800 placeholder-gray-400 rounded-xl px-5 pl-11 py-3 text-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-[#D4A97A]/60 transition-all duration-200 shadow-sm"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#B57908] hover:bg-[#9a6507] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Search
        </button>
      </form>

      {/* ── Heading ── */}
      {keyword && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Results for{" "}
            <span className="text-[#B57908]">&ldquo;{keyword}&rdquo;</span>
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {total} product{total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!keyword && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold">Search for anything</p>
          <p className="text-sm mt-1">Type a keyword and press Enter</p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && <ProductSkeleton />}

      {/* ── Error ── */}
      {isError && (
        <p className="text-center text-red-500 py-12">
          Something went wrong. Please try again.
        </p>
      )}

      {/* ── No results ── */}
      {!isLoading && !isError && keyword && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-lg font-semibold dark:text-white">No products found</p>
          <p className="text-sm mt-1">Try a different keyword</p>
        </div>
      )}

      {/* ── Product grid ── */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(({ document: p }) => (
            <Link
              key={p.id}
              href={`/product/${p.productSlug}`}
              onClick={() => addRecentSearch(p.productName)}
              className="group bg-white dark:bg-[#1f1a16] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 dark:bg-[#2a2420] p-3">
                {p.disRate > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    {Math.round(p.disRate)}%
                  </span>
                )}
                <Image
                  src={p.thumbnailsUrl || NoImg.src}
                  alt={p.productName}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-200 font-medium leading-snug line-clamp-2 group-hover:text-[#B57908] transition-colors">
                  {p.productName}
                </p>
                <p className={`text-[10px] font-semibold mt-1 ${p.isStockAvailable ? "text-green-500" : "text-red-500"}`}>
                  {p.isStockAvailable ? "In Stock" : "Out of Stock"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-auto pt-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(p.discountedPrice)}
                  </span>
                  {p.regularPrice > p.discountedPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(p.regularPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                  {p.categoryName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Suspense wrapper required for useSearchParams in Next.js app router
export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
