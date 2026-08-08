"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/share/GlobalProductCard";
import ProductGridSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";

const LIMIT = 12;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductItem {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string } | null;
}

export interface ProductListResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ProductItem[];
}

interface Props {
  brandSlug: string;
  categorySlug?: string;
  selectedAttributes?: string[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string | null;
  currentPage: number;
  currentSort?: string;
  onPageChange: (page: number) => void;
  onClearFilter: () => void;
  initialProducts: ProductItem[];
  initialTotalCount: number;
  initialTotalPages: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrandProductListClient({
  brandSlug,
  categorySlug,
  selectedAttributes = [],
  minPrice,
  maxPrice,
  stockStatus,
  currentSort,
  onClearFilter,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
}: Props) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(initialProducts);
  const [page, setPage]               = useState(1);
  const [totalCount, setTotalCount]   = useState(initialTotalCount);
  const [hasMore, setHasMore]         = useState(initialTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // ── Filter key — when any filter changes, reset and re-fetch from page 1 ──
  const filterKey = [
    brandSlug,
    categorySlug ?? "",
    selectedAttributes.join(","),
    minPrice ?? "",
    maxPrice ?? "",
    stockStatus ?? "",
    currentSort ?? "",
  ].join("|");

  useEffect(() => {
    // Reset & fetch page 1 with new filters
    const fetchPage1 = async () => {
      setIsFirstLoad(true);
      setAllProducts([]);
      setPage(1);
      setHasMore(false);
      try {
        const qp = buildParams(1);
        const res = await api.get<ProductListResponse>(`/products?${qp}`);
        const items = res?.data ?? [];
        setAllProducts(items);
        setTotalCount(res?.totalCount ?? items.length);
        setPage(1);
        setHasMore(1 < (res?.totalPages ?? 1));
      } catch (err) {
        console.error("[BrandProductListClient] page 1 fetch failed:", err);
      } finally {
        setIsFirstLoad(false);
      }
    };

    // On first render use initialProducts (SSR data), skip fetch
    const isDefaultState =
      !categorySlug &&
      selectedAttributes.length === 0 &&
      minPrice === undefined &&
      maxPrice === undefined &&
      !stockStatus &&
      (!currentSort || currentSort === "recommend");

    if (isDefaultState) {
      setAllProducts(initialProducts);
      setTotalCount(initialTotalCount);
      setPage(1);
      setHasMore(initialTotalPages > 1);
    } else {
      fetchPage1();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // ── Build query params ────────────────────────────────────────────────────
  const buildParams = useCallback((pageNum: number) => {
    const qp = new URLSearchParams({
      brandSlug,
      page:  String(pageNum),
      limit: String(LIMIT),
    });
    if (categorySlug)                  qp.set("subCategorySlug",    categorySlug);
    if (selectedAttributes.length > 0) qp.set("attributes",         selectedAttributes.join(","));
    if (minPrice !== undefined)        qp.set("minDiscountedPrice", String(minPrice));
    if (maxPrice !== undefined)        qp.set("maxDiscountedPrice", String(maxPrice));
    if (stockStatus)                   qp.set("stockStatus",        stockStatus);
    if (currentSort && currentSort !== "recommend") qp.set("sort", currentSort);
    return qp.toString();
  }, [brandSlug, categorySlug, selectedAttributes, minPrice, maxPrice, stockStatus, currentSort]);

  // ── Fetch next page ───────────────────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const res = await api.get<ProductListResponse>(`/products?${buildParams(nextPage)}`);
      const newItems = res?.data ?? [];
      if (newItems.length > 0) {
        setAllProducts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? 1));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[BrandProductListClient] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page, buildParams]);

  // ── Intersection Observer ─────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isFirstLoad) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchNextPage, hasMore, isFetchingMore, isFirstLoad]);

  const hasActiveFilters = Boolean(
    categorySlug ||
    selectedAttributes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    stockStatus
  );

  return (
    <div>
      {/* Title */}
      <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
        Products of <span className="capitalize">{categorySlug ? categorySlug : brandSlug}</span>
      </h3>

      {/* Count + clear */}
      <p className="text-xs text-gray-400 mb-4 h-4">
        {!isFirstLoad && `${totalCount.toLocaleString()} products found`}
        {!isFirstLoad && hasActiveFilters && (
          <button onClick={onClearFilter} className="ml-2 text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
            Clear filters
          </button>
        )}
      </p>

      {/* First load skeleton */}
      {isFirstLoad && <ProductGridSkeleton count={LIMIT} cols="4" />}

      {/* Empty */}
      {!isFirstLoad && allProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
          {hasActiveFilters && (
            <button onClick={onClearFilter} className="text-xs text-[#6D3F0E] dark:text-[#d4a97a] hover:underline">
              Show all products
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!isFirstLoad && allProducts.length > 0 && (
        <div className="grid md:grid-cols-4 grid-cols-2 lg:gap-4 gap-2">
          {allProducts.map((product, i) => (
            <ProductCard
              key={`${product.productUuid}-${i}`}
              productUuid={product.productUuid}
              image={product.thumbnails?.mediaFileUrl || NoImg.src}
              title={product.productName}
              price={product.discountedPrice || product.regularPrice || 0}
              originalPrice={product.regularPrice || 0}
              discount={product.disRate || 0}
              badge={product.productBadge || undefined}
              inStock={!product.isTba}
              isBestDeal={product.disRate > 0}
              slug={product.productSlug}
            />
          ))}
        </div>
      )}

      {/* Loader trigger div */}
      <div ref={loaderRef} className="h-10 w-full" />

      {/* Loading more skeleton */}
      {isFetchingMore && <ProductGridSkeleton count={4} cols="4" />}

      {/* All loaded */}
      {!hasMore && allProducts.length > 0 && !isFetchingMore && !isFirstLoad && (
        <p className="text-center text-xs text-gray-400 py-6">
          ✅ সব {allProducts.length.toLocaleString()} টি পণ্য দেখানো হয়েছে
        </p>
      )}
    </div>
  );
}
