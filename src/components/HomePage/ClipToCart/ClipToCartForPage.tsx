"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import ReelModal from "./ReelModal";
import ClipToCartCard from "./ClipToCartCard";
import {
  clipEndpoint,
  mapClipProduct,
  type ClipApiResponse,
  type ClipProduct,
} from "./clipToCart.shared";

export type { ClipProduct } from "./clipToCart.shared";

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ClipToCartForPageProps {
  /** First page, already fetched and mapped on the server. */
  initialProducts: ClipProduct[];
  /** Total pages reported by the API for the current page size. */
  totalPages: number;
}

function ClipToCartForPage({
  initialProducts,
  totalPages,
}: ClipToCartForPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  // Page 1 arrives from the server, so the grid is populated on first paint and
  // this only ever fetches pages 2+. A sentinel below the grid triggers the next
  // page as it comes into view; loading stops once the API runs out of pages.
  const [products, setProducts] = useState<ClipProduct[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalPages > 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Synchronous companion to isLoadingMore. The observer can fire twice in the
  // same frame — faster than a state update propagates — which sent two
  // requests for the same page. A ref flips immediately, so the second call
  // returns before it can fetch.
  const loadingRef = useRef(false);

  // Server data wins whenever it changes (revalidation, navigation back here).
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(totalPages > 1);
  }, [initialProducts, totalPages]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    const nextPage = page + 1;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const res = await api.get<ClipApiResponse>(clipEndpoint(nextPage));
      const mapped = (res?.data ?? []).map(mapClipProduct);

      if (mapped.length === 0) {
        setHasMore(false);
      } else {
        // Guard against duplicates: a product added to the showcase between two
        // requests shifts everything down a slot, which can repeat an item.
        setProducts((prev) => {
          const seen = new Set(prev.map((x) => x.id));
          return [...prev, ...mapped.filter((x) => !seen.has(x.id))];
        });
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? nextPage));
      }
    } catch (err) {
      // A failed page shouldn't wipe what's already on screen — stop paging and
      // leave the loaded clips in place.
      console.error("[ClipToCart] failed to load page", nextPage, err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, page]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      // Start fetching a little before the sentinel is actually visible, so the
      // next row is usually ready by the time the user reaches it.
      { rootMargin: "300px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!products.length) {
    return (
      <div className="py-16 text-center">
        <h1 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No clips are available right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header — h1 because this is the page's own subject; the shared header
          carries no heading, so without it the page had none at all. */}
      <div className="flex justify-between items-center gap-6 pb-5">
        <h1 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h1>
      </div>

      {/*
        Responsive grid, not a carousel.
        This is the dedicated listing page, so every clip should be reachable by
        scrolling rather than hidden behind slider paging — and a grid keeps the
        whole set in the server-rendered HTML.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ClipToCartCard
            key={product.id}
            product={product}
            index={i}
            onOpenModal={(idx) => {
              setSelectedIndex(idx);
              setModalOpen(true);
            }}
          />
        ))}

        {/* Placeholders sized like a card, so the grid doesn't jump while the
            next page is in flight. */}
        {isLoadingMore &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-2xl h-[350px]"
            />
          ))}
      </div>

      {/* Sentinel — observed to trigger the next page. */}
      {hasMore && <div ref={sentinelRef} className="h-10 w-full" aria-hidden />}

      <div className="pb-10" />

      <ReelModal
        isOpen={modalOpen}
        initialIndex={selectedIndex}
        products={products}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default ClipToCartForPage;