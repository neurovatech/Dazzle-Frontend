/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductCard from "@/components/share/GlobalProductCard";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";
import { ProductItem, ProductListResponse } from "@/app/(public)/categories/[categorySlug]/page";
import { scrollSession, restoreScrollY } from "@/hooks/useScrollRestoration";
import { sortInStockFirst } from "@/lib/sortProducts";

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
  // unused router/pathname/searchParams kept for potential future use
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Scroll-session key — unique per route ─────────────────────────────────
  const scrollKey = `cat_${categorySlug}${subCategorySlug ? `_${subCategorySlug}` : ""}`;

  // ── Infinite scroll state ─────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<ProductItem[]>(ssrProducts);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(ssrTotalPages > 1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // true while we are silently re-fetching pages to restore a previous session
  const [isRestoring, setIsRestoring] = useState(false);
  const loaderRef    = useRef<HTMLDivElement>(null);
  // whether the initial session restore has already been attempted this mount
  const didRestoreRef = useRef(false);

  const hasFilter = Boolean(
    selectedBrandSlug ||
    selectedAttributes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    (stockStatus !== null && stockStatus !== undefined && stockStatus !== "")
  );

  // Filter key to detect client-side filter/sort changes
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

  const prevFilterKeyRef    = useRef(filterKey);
  const prevSsrProductsRef  = useRef(ssrProducts);

  // ── Build API query params ────────────────────────────────────────────────
  const buildParams = useCallback((pageNum: number) => {
    const p = new URLSearchParams({
      page:         String(pageNum),
      limit:        String(LIMIT),
      categorySlug,
    });
    if (subCategorySlug)               p.set("subCategorySlug",     subCategorySlug);
    if (selectedBrandSlug)             p.set("brandSlug",           selectedBrandSlug);
    if (selectedAttributes.length > 0) p.set("attributes",          selectedAttributes.join(","));
    if (minPrice !== undefined)        p.set("minDiscountedPrice",  String(minPrice));
    if (maxPrice !== undefined)        p.set("maxDiscountedPrice",  String(maxPrice));
    if (stockStatus)                   p.set("stockStatus",         stockStatus);
    if (currentSort === "newest")           p.set("latest",          "1");
    else if (currentSort === "price_asc")   p.set("discountedPrice", "low-to-high");
    else if (currentSort === "price_desc")  p.set("discountedPrice", "high-to-low");
    if (currentSearch)                 p.set("search",              currentSearch);
    return p.toString();
  }, [categorySlug, subCategorySlug, selectedBrandSlug, selectedAttributes, minPrice, maxPrice, stockStatus, currentSort, currentSearch]);

  // ── Session restore on first mount ────────────────────────────────────────
  // Only runs once, only when NO filters are active (fresh landing / reload / back).
  // Reads saved { loadedPages, scrollY } from sessionStorage, silently fetches
  // pages 2..loadedPages (page 1 already comes from SSR), then scrolls.
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    // Don't restore when the user arrived with active filters — those are a
    // deliberate new session state, not a continuation of a previous scroll.
    if (hasFilter) return;

    const saved = scrollSession.read(scrollKey);
    if (!saved || saved.loadedPages <= 1) return;

    const { loadedPages, scrollY } = saved;

    const restore = async () => {
      setIsRestoring(true);
      try {
        // Fetch pages 2..loadedPages in order and append to SSR page-1 data
        let accumulated: ProductItem[] = [...ssrProducts];
        let lastTotalPages = ssrTotalPages;

        for (let p = 2; p <= loadedPages; p++) {
          const res = await api.get<ProductListResponse>(
            `/products?${buildParams(p)}`
          );
          const items = res?.data ?? [];
          accumulated = [...accumulated, ...items];
          lastTotalPages = res?.totalPages ?? lastTotalPages;
        }

        setAllProducts(sortInStockFirst(accumulated));
        setPage(loadedPages);
        setHasMore(loadedPages < lastTotalPages);
      } catch (err) {
        console.error("[AllProducts] session restore fetch failed:", err);
      } finally {
        setIsRestoring(false);
        // Scroll after DOM has been updated with all the products
        restoreScrollY(scrollY);
        // Keep the session entry intact — it will be overwritten on next save.
        // Clear only after successful scroll so a hard-refresh also restores.
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  // ── Save session state on every page/scroll change ────────────────────────
  // We save on: beforeunload (F5, close tab), visibilitychange (mobile), and
  // whenever the user clicks a <Link> to a product detail page.
  useEffect(() => {
    const save = () => {
      scrollSession.save(scrollKey, page, window.scrollY);
    };

    window.addEventListener("beforeunload", save);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Capture scroll position when clicking any product card link
    const onLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // Only save when navigating away to a different path
      if (href && !href.startsWith("#") && href !== window.location.pathname) {
        scrollSession.save(scrollKey, page, window.scrollY);
      }
    };
    document.addEventListener("click", onLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onLinkClick, true);
    };
  }, [scrollKey, page]); // re-register when page number changes

  // ── Sync with SSR data or fetch page-1 on filter/sort change ─────────────
  useEffect(() => {
    // SSR products changed (new slug navigation) — sync and reset
    if (prevSsrProductsRef.current !== ssrProducts) {
      prevSsrProductsRef.current = ssrProducts;
      prevFilterKeyRef.current   = filterKey;
      setAllProducts(sortInStockFirst(ssrProducts));
      setPage(1);
      setHasMore(ssrTotalPages > 1);
      return;
    }

    // Client-side filter or sort change — fetch page 1
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;

      const fetchPage1 = async () => {
        setIsFetchingMore(true);
        try {
          const res = await api.get<ProductListResponse>(
            `/products?${buildParams(1)}`
          );
          const items = res?.data ?? [];
          setAllProducts(sortInStockFirst(items));
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

  // ── Fetch next page (infinite scroll) ────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore || isRestoring) return;
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
  }, [isFetchingMore, hasMore, isRestoring, page, buildParams]);

  // ── Intersection Observer ─────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isRestoring) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchNextPage, hasMore, isFetchingMore, isRestoring]);

  const displayTotal = hasFilter ? allProducts.length : ssrTotalCount;

  return (
    <div className="w-full">
      {/* ── Empty state ── */}
    

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

        {allProducts.length === 0 && !isFetchingMore && !isRestoring && (
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

      {/* ── Restore skeleton — shown while silently re-fetching previous pages ── */}
      {isRestoring && <ProductGridSkeleton count={LIMIT} />}

      {/* ── Product grid ── */}
      {!isRestoring && allProducts.length > 0 && (
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
    </div>
  );
}

export default AllProducts;
