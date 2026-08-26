/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";
import { scrollSession, restoreScrollY } from "@/hooks/useScrollRestoration";

interface CategoryItem {
  uuid: string;
  thumbnail_img: string;
  category_name: string;
  category_slug: string;
  is_featured?: boolean;
  is_active?: boolean;
}

interface CategoriesCardProps {
  seeAllBtn?: boolean;
  categories?: CategoryItem[];
  totalPages?: number;
  currentPage?: number;
}

interface CategoriesApiResponse {
  data: any[];
  totalPages?: number;
  totalCount?: number;
}

const isEmpty = (value: string | null | undefined): boolean =>
  !value || value.trim() === "";

const LIMIT      = 16;
const SCROLL_KEY = "categories_page";

// ─── Component ────────────────────────────────────────────────────────────────

function CategoriesCard({
  seeAllBtn = true,
  categories: initialCategories = [],
  totalPages: initialTotalPages = 1,
  currentPage: initialPage = 1,
}: CategoriesCardProps) {

  // ── Infinite scroll only on /categories page (seeAllBtn=false) ───────────
  const [allCategories, setAllCategories]   = useState<CategoryItem[]>(initialCategories);
  const [page, setPage]                     = useState(initialPage);
  const [hasMore, setHasMore]               = useState(
    !seeAllBtn && initialTotalPages > initialPage
  );
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // true while silently re-fetching previously-loaded pages on restore
  const [isRestoring, setIsRestoring]       = useState(false);
  const loaderRef     = useRef<HTMLDivElement>(null);
  const didRestoreRef = useRef(false);

  // ── Fetch a single page of categories ────────────────────────────────────
  const fetchPage = useCallback(async (pageNum: number): Promise<{ items: CategoryItem[]; totalPages: number }> => {
    const res = await api.get<CategoriesApiResponse>(
      `/categories?page=${pageNum}&limit=${LIMIT}`,
      { cache: "no-store" }
    );
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    const items: CategoryItem[] = list.map((c: any) => ({
      uuid:          String(c.uuid ?? ""),
      category_name: String(c.category_name ?? ""),
      category_slug: String(c.category_slug ?? ""),
      thumbnail_img: c.thumbnail_img ? String(c.thumbnail_img) : "",
      is_featured:   Boolean(c.is_featured),
      is_active:     Boolean(c.is_active),
    }));
    const totalPgs = Number(Array.isArray(res) ? 1 : (res as any)?.totalPages ?? 1);
    return { items, totalPages: totalPgs };
  }, []);

  // ── Session restore on first mount (only on full /categories page) ────────
  useEffect(() => {
    if (seeAllBtn) return;           // homepage widget — skip
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    const saved = scrollSession.read(SCROLL_KEY);
    if (!saved || saved.loadedPages <= 1) return;

    const { loadedPages, scrollY } = saved;

    const restore = async () => {
      setIsRestoring(true);
      try {
        let accumulated: CategoryItem[] = [...initialCategories];
        let lastTotalPages = initialTotalPages;

        for (let p = 2; p <= loadedPages; p++) {
          const { items, totalPages } = await fetchPage(p);
          accumulated    = [...accumulated, ...items];
          lastTotalPages = totalPages;
        }

        setAllCategories(accumulated);
        setPage(loadedPages);
        setHasMore(loadedPages < lastTotalPages);
      } catch (err) {
        console.error("[CategoriesCard] session restore failed:", err);
      } finally {
        setIsRestoring(false);
        restoreScrollY(scrollY);
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // ── Save session on beforeunload / visibilitychange / link click ──────────
  useEffect(() => {
    if (seeAllBtn) return; // homepage widget — nothing to save

    const save = () => scrollSession.save(SCROLL_KEY, page, window.scrollY);

    window.addEventListener("beforeunload", save);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (href && !href.startsWith("#") && href !== window.location.pathname) {
        scrollSession.save(SCROLL_KEY, page, window.scrollY);
      }
    };
    document.addEventListener("click", onLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onLinkClick, true);
    };
  }, [seeAllBtn, page]);

  // ── Reset when SSR data changes ───────────────────────────────────────────
  useEffect(() => {
    setAllCategories(initialCategories);
    setPage(initialPage);
    setHasMore(!seeAllBtn && initialTotalPages > initialPage);
  }, [initialCategories, initialTotalPages, initialPage, seeAllBtn]);

  // ── Fetch next page (normal infinite scroll) ──────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore || isRestoring) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const { items, totalPages } = await fetchPage(nextPage);
      if (items.length > 0) {
        setAllCategories((prev) => [...prev, ...items]);
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[CategoriesCard] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, isRestoring, page, fetchPage]);

  // ── Intersection Observer — only on full /categories page ─────────────────
  useEffect(() => {
    if (seeAllBtn) return;
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
  }, [fetchNextPage, hasMore, isFetchingMore, isRestoring, seeAllBtn]);

  // homepage uses SSR items directly (no infinite scroll, no restore)
  const displayCategories = seeAllBtn ? initialCategories : allCategories;

  return (
    <div className="md:px-12.5 px-4">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <h1 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Categories
        </h1>
        {seeAllBtn && (
          <Link
            href="/categories"
            className="text-sm font-medium text-primary bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28] hover:underline hover:text-[#CB843B]! transition-colors duration-300"
          >
            See all
          </Link>
        )}
      </div>

      {/* ── Restore skeleton ── */}
      {isRestoring && (
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 py-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-4xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="w-3/4 h-3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {!isRestoring && (
        <div className="py-4">
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {displayCategories.map((item) => {
              const hasImage = !isEmpty(item.thumbnail_img);
              const hasName  = !isEmpty(item.category_name);
              const hasSlug  = !isEmpty(item.category_slug);

              const href = hasSlug
                ? `/categories/${item.category_slug}`
                : hasName
                  ? `/categories/${item.category_name.toLowerCase().replace(/\s+/g, "-")}`
                  : "/categories";

              return (
                <Link key={item.uuid} href={href} className="flex flex-col items-center">
                  <div className="relative w-full aspect-square bg-[#F5F5F5] rounded-4xl p-6 md:p-8 transition-all duration-300 hover:scale-105 hover:bg-[#fcf5ed] hover:border-[#E9CCAE] border border-[#F5F5F5]">
                    <Image
                      src={hasImage ? item.thumbnail_img : NoImg}
                      alt={hasName ? item.category_name : "Category"}
                      fill
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-contain transition-transform duration-300 hover:scale-110 p-5"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          (NoImg as any).src ?? NoImg.toString();
                      }}
                    />
                  </div>
                  <h2 className="w-full text-[14px] sm:text-[14px] font-medium text-primary pt-1 sm:pt-2 text-center transition-colors duration-300 group-hover:text-[#CB843B] line-clamp-2 leading-tight min-h-[22px] sm:min-h-[26px] lg:min-h-[36px] flex items-start justify-center">
                    {hasName ? (
                      item.category_name
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">No name</span>
                    )}
                  </h2>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Infinite scroll loader (only on full /categories page) ── */}
      {!seeAllBtn && (
        <>
          <div ref={loaderRef} className="h-10 w-full" />

          {isFetchingMore && (
            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 pb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-4xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="w-3/4 h-3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CategoriesCard;
