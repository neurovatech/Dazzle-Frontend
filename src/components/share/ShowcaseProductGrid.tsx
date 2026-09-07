"use client";

/**
 * ShowcaseProductGrid
 *
 * Reusable client component for any page that displays showcase products
 * with infinite scroll.
 *
 * SSR page fetches page-1 and passes it as `initialProducts`.
 * This component appends subsequent pages via IntersectionObserver.
 *
 * Usage:
 *   <ShowcaseProductGrid
 *     showcaseSlug="hot-deal"
 *     initialProducts={products}
 *     initialTotalPages={totalPages}
 *     cols={5}          // grid columns on desktop (default 5)
 *   />
 */

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/share/GlobalProductCard";
import {
  ShowcaseProduct,
  ShowcaseItemsResponse,
  mapShowcaseItems,
} from "@/lib/fetchShowcaseProducts";
import { api } from "@/lib/api";

const LIMIT = 50;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function GridSkeleton({ cols, count = 10 }: { cols: number; count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} lg:gap-4 gap-2`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  showcaseSlug:      string;
  initialProducts:   ShowcaseProduct[];
  initialTotalPages: number;
  /** Desktop grid columns — passed as Tailwind md:grid-cols-{cols} */
  cols?: 4 | 5;
}

export default function ShowcaseProductGrid({
  showcaseSlug,
  initialProducts,
  initialTotalPages,
  cols = 5,
}: Props) {
  const [allProducts, setAllProducts]       = useState<ShowcaseProduct[]>(initialProducts);
  const [page, setPage]                     = useState(1);
  const [hasMore, setHasMore]               = useState(initialTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when SSR props change (e.g. navigating between showcase pages)
  useEffect(() => {
    setAllProducts(initialProducts);
    setPage(1);
    setHasMore(initialTotalPages > 1);
  }, [initialProducts, initialTotalPages]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const res = await api.get<ShowcaseItemsResponse>(
        `/showcase-items?showcaseSlug=${encodeURIComponent(showcaseSlug)}&page=${nextPage}&limit=${LIMIT}`,
        { cache: "no-store" },
      );
      const newItems = mapShowcaseItems(Array.isArray(res?.data) ? res.data : []);
      if (newItems.length > 0) {
        setAllProducts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? 1));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[ShowcaseProductGrid] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, showcaseSlug]);

  // IntersectionObserver — triggers when loader div enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchNextPage, hasMore, isFetchingMore]);

  const colClass = cols === 4 ? "md:grid-cols-4" : "md:grid-cols-5";

  return (
    <div className="w-full">
      {/* Product grid */}
      {allProducts.length > 0 ? (
        <div className={`grid grid-cols-2 ${colClass} lg:gap-2 gap-2`}>
          {allProducts.map((product) => (
            <div key={product.productUuid}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-4xl">😔</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* Loading skeleton */}
      {isFetchingMore && <GridSkeleton cols={cols} count={cols * 2} />}
    </div>
  );
}
