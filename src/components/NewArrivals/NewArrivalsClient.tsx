"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/share/GlobalProductCard";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";

interface ShowcaseItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string };
}

interface ShowcaseItemsResponse {
  data: ShowcaseItem[];
  totalPages: number;
  totalCount: number;
}

interface Props {
  initialProducts: ShowcaseItem[];
  initialTotalPages: number;
  initialTotalCount: number;
}

const LIMIT = 30;

function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
      ))}
    </div>
  );
}

export default function NewArrivalsClient({
  initialProducts,
  initialTotalPages,
  initialTotalCount,
}: Props) {
  const [allProducts, setAllProducts] = useState<ShowcaseItem[]>(initialProducts);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(initialTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const res = await api.get<ShowcaseItemsResponse>(
        `/products?latest=1&page=${nextPage}&limit=${LIMIT}`,
        { cache: "no-store" }
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
      console.error("[NewArrivalsClient] fetch error:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page]);

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

  return (
    <>
      {/* Product grid */}
      <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
        {allProducts.map((product, i) => (
          <ProductCard
            key={`${product.productUuid}-${i}`}
            productUuid={product.productUuid}
            image={product.thumbnails?.mediaFileUrl || NoImg.src}
            title={product.productName}
            price={product.discountedPrice || product.regularPrice || 0}
            originalPrice={product.regularPrice || 0}
            discount={Math.round(product.disRate || 0)}
            badge={product.productBadge || undefined}
            inStock={!product.isTba}
            isBestDeal={product.disRate > 15}
            slug={product.productSlug || product.productUuid}
          />
        ))}
      </div>

      {/* Loader trigger */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* Loading more */}
      {isFetchingMore && <ProductGridSkeleton count={5} />}

      {/* All loaded */}
      {!hasMore && allProducts.length > 0 && !isFetchingMore && (
        <p className="text-center text-xs text-gray-400 py-6">
          ✅ সব {allProducts.length.toLocaleString()} টি পণ্য দেখানো হয়েছে
        </p>
      )}
    </>
  );
}
