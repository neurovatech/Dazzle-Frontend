/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";
import { ProductItem, ProductListResponse } from "@/app/(public)/categories/[categorySlug]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllProductsProps {
  categorySlug: string;
  subCategorySlug?: string;
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
  selectedBrandSlug?: string | null;
  selectedAttributes?: string[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string | null;
  onClearFilter?: () => void;
  filterApplyKey?: number;
}

const LIMIT = 12;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AllProducts({
  categorySlug,
  subCategorySlug,
  currentPage,
  products: ssrProducts,
  totalPages: ssrTotalPages,
  totalCount: ssrTotalCount,
  currentSort,
  currentSearch,
  selectedBrandSlug,
  selectedAttributes = [],
  minPrice,
  maxPrice,
  stockStatus,
  onClearFilter,
  filterApplyKey,
}: AllProductsProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Infinite scroll state ─────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<ProductItem[]>(ssrProducts);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(ssrTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const hasFilter = Boolean(
    selectedBrandSlug ||
    selectedAttributes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    (stockStatus !== null && stockStatus !== undefined && stockStatus !== "")
  );

  // Filter key to detect client-side changes
  const filterKey = [
    categorySlug,
    subCategorySlug ?? "",
    selectedBrandSlug ?? "",
    selectedAttributes.join(","),
    minPrice ?? "",
    maxPrice ?? "",
    stockStatus ?? "",
    currentSort ?? "",
    currentSearch ?? "",
    filterApplyKey ?? 0,
  ].join("|");

  const prevFilterKeyRef = useRef(filterKey);
  const prevSsrProductsRef = useRef(ssrProducts);

  // ── Sync with SSR data or Fetch Client-side on Filter/Sort Change ──────────
  useEffect(() => {
    // If SSR products changed (e.g. initial load or parent SSR refetch), sync them
    if (prevSsrProductsRef.current !== ssrProducts) {
      prevSsrProductsRef.current = ssrProducts;
      prevFilterKeyRef.current = filterKey;
      setAllProducts(ssrProducts);
      setPage(1);
      setHasMore(ssrTotalPages > 1);
      return;
    }

    // If client-side filters or sort changed, fetch page 1
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;

      const fetchPage1 = async () => {
        setIsFetchingMore(true);
        try {
          const res = await api.get<ProductListResponse>(
            `/products?${buildParams(1)}`
          );
          const items = res?.data ?? [];
          setAllProducts(items);
          setPage(1);
          setHasMore(1 < (res?.totalPages ?? 1));
        } catch (err) {
          console.error("[AllProducts] client-side page 1 fetch failed:", err);
        } finally {
          setIsFetchingMore(false);
        }
      };

      fetchPage1();
    }
  }, [filterKey, ssrProducts, ssrTotalPages]);

  // ── Build API query params ────────────────────────────────────────────────
  const buildParams = useCallback((pageNum: number) => {
    const p = new URLSearchParams({
      page:         String(pageNum),
      limit:        String(LIMIT),
      categorySlug,
    });
    if (subCategorySlug)               p.set("subCategorySlug",      subCategorySlug);
    if (selectedBrandSlug)             p.set("brandSlug",            selectedBrandSlug);
    if (selectedAttributes.length > 0) p.set("attributes",           selectedAttributes.join(","));
    if (minPrice !== undefined)        p.set("minDiscountedPrice",   String(minPrice));
    if (maxPrice !== undefined)        p.set("maxDiscountedPrice",   String(maxPrice));
    if (stockStatus)                   p.set("stockStatus",          stockStatus);
    // Sort params — API-র জন্য সঠিক params map করা হচ্ছে
    if (currentSort === "newest")           p.set("latest",           "1");
    else if (currentSort === "price_asc")   p.set("discountedPrice",  "low-to-high");
    else if (currentSort === "price_desc")  p.set("discountedPrice",  "high-to-low");
    if (currentSearch)                 p.set("search",               currentSearch);
    return p.toString();
  }, [categorySlug, subCategorySlug, selectedBrandSlug, selectedAttributes, minPrice, maxPrice, stockStatus, currentSort, currentSearch]);

  // ── Fetch next page ───────────────────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const res = await api.get<ProductListResponse>(
        `/products?${buildParams(nextPage)}`
      );
      const newItems = res?.data ?? [];
      if (newItems.length > 0) {
        setAllProducts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? 1));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[AllProducts] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, buildParams]);

  // ── Intersection Observer — trigger when loader div is visible ────────────
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

  const displayTotal = hasFilter ? (allProducts.length) : ssrTotalCount;

  return (
    <div className="w-full">
      {/* ── Empty state ── */}
      {allProducts.length === 0 && !isFetchingMore && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-4xl">😔</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
          {hasFilter && onClearFilter && (
            <button onClick={onClearFilter} className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Show all products
            </button>
          )}
        </div>
      )}

      <div className="md:flex md:flex-wrap items-center justify-between gap-3 pb-3 hidden">
        <div>
          <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            Products of <span className="capitalize"> {subCategorySlug || categorySlug} </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {displayTotal.toLocaleString()} products found
            {selectedBrandSlug && (
              <span className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] font-semibold">
                · {selectedBrandSlug}
              </span>
            )}
            {hasFilter && onClearFilter && (
              <button
                onClick={onClearFilter}
                className="ml-3 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      </div>

      {/* ── Product grid ── */}
      {allProducts.length > 0 && (
        <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3">
          {allProducts.map((product, i) => {
            const imgSrc        = product.thumbnails?.mediaFileUrl || NoImg.src;
            const price         = product.discountedPrice || product.regularPrice || 0;
            const originalPrice = product.regularPrice || 0;
            return (
              <ProductCard
                key={`${product.productUuid}-${i}`}
                productUuid={product.productUuid}
                image={imgSrc}
                title={product.productName}
                price={price}
                originalPrice={originalPrice}
                discount={product.disRate || 0}
                badge={product.productBadge || undefined}
                inStock={!product.isTba}
                isBestDeal={false}
                slug={product.productSlug || product.productUuid}
              />
            );
          })}
        </div>
      )}

      {/* ── Loader trigger div (Intersection Observer watches this) ── */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* ── Loading more indicator ── */}
      {isFetchingMore && <ProductGridSkeleton count={4} />}

      {/* ── All loaded message ── */}
      {/* {!hasMore && allProducts.length > 0 && !isFetchingMore && (
        <p className="text-center text-xs text-gray-400 py-6">
          ✅ সব {allProducts.length.toLocaleString()} টি পণ্য দেখানো হয়েছে
        </p>
      )} */}
    </div>
  );
}

export default AllProducts;
