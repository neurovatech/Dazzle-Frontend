"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import { ProductItem } from "@/app/(public)/brands/[slug]/page";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandProductListProps {
  brandSlug: string;
  currentPage: number;
  products: ProductItem[];
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentSearch: string;
}

interface ProductListResponse {
  data: ProductItem[];
  totalPages: number;
  totalCount: number;
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

function BrandProductList({
  brandSlug,
  products: ssrProducts,
  totalPages: ssrTotalPages,
  totalCount: ssrTotalCount,
  currentSort,
  currentSearch,
}: BrandProductListProps) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(ssrProducts);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(ssrTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // ── Reset when SSR data / sort / search changes ───────────────────────────
  useEffect(() => {
    setAllProducts(ssrProducts);
    setPage(1);
    setHasMore(ssrTotalPages > 1);
  }, [ssrProducts, ssrTotalPages, currentSort, currentSearch]);

  // ── Fetch next page ───────────────────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const qp = new URLSearchParams({
        brandSlug,
        page:  String(nextPage),
        limit: String(LIMIT),
      });
      if (currentSort)   qp.set("sort",   currentSort);
      if (currentSearch) qp.set("search", currentSearch);

      const res = await api.get<ProductListResponse>(`/products?${qp.toString()}`);
      const newItems = res?.data ?? [];
      if (newItems.length > 0) {
        setAllProducts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? 1));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[BrandProductList] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, brandSlug, currentSort, currentSearch]);

  // ── Intersection Observer — fires when loader div is visible ──────────────
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

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 mt-8">
        <div>
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            All Products
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {ssrTotalCount.toLocaleString()} products found
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {allProducts.length === 0 && !isFetchingMore && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products found for this brand.
          </p>
        </div>
      )}

      {/* ── Product grid ── */}
      {allProducts.length > 0 && (
        <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2 py-3 w-full">
          {allProducts.map((product, i) => {
            const imgSrc        = product.thumbnails?.mediaFileUrl || NoImg.src;
            const price         = product.discountedPrice || product.regularPrice || 0;
            const originalPrice = product.regularPrice || 0;
            return (
              <ProductCard
                key={`${product.productUuid}-${i}`}
                image={imgSrc}
                title={product.productName}
                price={price}
                originalPrice={originalPrice}
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

      {/* ── Loader trigger (Intersection Observer watches this) ── */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* ── Loading more skeleton ── */}
      {isFetchingMore && <ProductGridSkeleton count={4} />}

      {/* ── All products loaded message ── */}
      {/* {!hasMore && allProducts.length > 0 && !isFetchingMore && (
        <p className="text-center text-xs text-gray-400 py-6">
          ✅ সব {allProducts.length.toLocaleString()} টি পণ্য দেখানো হয়েছে
        </p>
      )} */}
    </>
  );
}

export default BrandProductList;
