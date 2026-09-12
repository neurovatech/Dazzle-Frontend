/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Grid,
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import type { Swiper as SwiperType } from "swiper";

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

const LIMIT = 16;

/**
 * One category icon image, with its own load state.
 *
 * The skeleton (CategoriesSkeleton) only covers the server data fetch —
 * once that resolves, this box itself has been in the DOM and visible for
 * a while before each icon's own bytes finish downloading. Tracking `loaded`
 * per image keeps that same pulse placeholder (identical to
 * CategoriesSkeleton's inner circle) showing until the real icon is actually
 * paintable, instead of an empty box or a slow top-to-bottom image draw-in.
 *
 * `priority` on the first row: without it these default to `loading="lazy"`,
 * and Swiper positions every slide (even the visible ones) via a CSS
 * transform right after mount — which confuses the browser's native
 * lazy-load distance heuristic into never firing the request at all, so the
 * skeleton above would otherwise spin forever instead of resolving. Same
 * fix already used for the other homepage carousels.
 */
function CategoryImage({
  src,
  alt,
  priority = false,
}: {
  src: string | StaticImageData;
  alt: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Read the DOM directly instead of relying only on the `onLoad` prop: a
  // cached/preloaded image (every `priority` image here is preloaded via a
  // <link rel="preload">) can already be `complete` the instant this effect
  // runs, or can fire its native `load` event before React's synthetic
  // handler attaches — either way `onLoad` alone silently misses it and the
  // skeleton never clears. Checking `complete` up front and attaching a
  // native listener as a fallback covers both cases.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      setLoaded(true);
      return;
    }
    const handleLoad = () => setLoaded(true);
    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleLoad);
    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleLoad);
    };
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-300/40 dark:bg-zinc-700/30 animate-pulse" />
        </div>
      )}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 25vw, 12vw"
        priority={priority}
        className={`object-contain p-2 transition-all duration-300 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            (NoImg as any).src ?? NoImg.toString();
          setLoaded(true);
        }}
      />
    </>
  );
}

function CategoriesCard({
  seeAllBtn = true,
  categories: initialCategories = [],
  totalPages: initialTotalPages = 1,
  currentPage: initialPage = 1,
}: CategoriesCardProps) {
  const [allCategories, setAllCategories] =
    useState<CategoryItem[]>(initialCategories);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(
    !seeAllBtn && initialTotalPages > initialPage,
  );
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setAllCategories(initialCategories);
    setPage(initialPage);
    setHasMore(!seeAllBtn && initialTotalPages > initialPage);
  }, [initialCategories, initialTotalPages, initialPage, seeAllBtn]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const res = await api.get<CategoriesApiResponse>(
        `/categories?page=${nextPage}&limit=${LIMIT}`,
        { cache: "no-store" },
      );
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      const newItems: CategoryItem[] = list.map((c: any) => ({
        uuid: String(c.uuid ?? ""),
        category_name: String(c.category_name ?? ""),
        category_slug: String(c.category_slug ?? ""),
        thumbnail_img: c.thumbnail_img ? String(c.thumbnail_img) : "",
        is_featured: Boolean(c.is_featured),
        is_active: Boolean(c.is_active),
      }));

      if (newItems.length > 0) {
        setAllCategories((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        const totalPgs = Number(
          Array.isArray(res) ? 1 : ((res as any)?.totalPages ?? 1),
        );
        setHasMore(nextPage < totalPgs);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[CategoriesCard] infinite scroll fetch failed:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page]);

  useEffect(() => {
    if (seeAllBtn) return; // homepage widget — no infinite scroll needed
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
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [fetchNextPage, hasMore, isFetchingMore, seeAllBtn]);

  const displayCategories = seeAllBtn ? initialCategories : allCategories;

  return (
    <div className="md:px-12.5 px-4">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        {/* h2, not h1: this is a section heading inside the homepage, whose
            single h1 describes the page as a whole. Two h1s (or an h1 that says
            "Categories") breaks the heading hierarchy Lighthouse checks. */}
        <h2 className="md:text-[32px] text-[18px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Categories
        </h2>
        {seeAllBtn && (
          <Link
            href="/categories"
            className="text-sm font-medium text-primary bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28] hover:underline hover:text-[#CB843B]! transition-colors duration-300"
          >
            See all
          </Link>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="py-4">
        <Swiper
          modules={[Navigation, Grid, Pagination, Scrollbar, A11y, Autoplay]}
          grid={{ rows: 2, fill: "row" }}
          slidesPerView={4}
          spaceBetween={10}
          pagination={{ clickable: true }}
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
              grid: { rows: 2, fill: "row" },
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 14,
              grid: { rows: 2, fill: "row" },
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 16,
              grid: { rows: 2, fill: "row" },
            },
            1024: {
              slidesPerView: 8,
              spaceBetween: 16,
              grid: { rows: 1, fill: "row" },
            },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="mySwiper w-full pt-1 pb-4"
        >
          {displayCategories.map((item, index) => {
            const hasImage = !isEmpty(item.thumbnail_img);
            const hasName = !isEmpty(item.category_name);
            const hasSlug = !isEmpty(item.category_slug);

            const href = hasSlug
              ? `/categories/${item.category_slug}`
              : hasName
                ? `/categories/${item.category_name.toLowerCase().replace(/\s+/g, "-")}`
                : "/categories";

            return (
              <SwiperSlide key={item.uuid}>
                <Link
                  href={href}
                  className="w-full flex flex-col items-center gap-2 group focus:outline-none cursor-pointer pb-2"
                >
                  {/* Category Box Container */}
                  <div
                    className={`
                      w-full aspect-square rounded-[28px] overflow-hidden transition-all duration-300
                      flex items-center justify-center p-3 sm:p-4 relative
                      bg-[#F5F5F5] border border-[#F5F5F5] shadow-sm
                      dark:bg-[#342a20] dark:border-[#B57908]
                      group-hover:bg-[#fcf5ed] group-hover:border-[#E9CCAE]
                    `}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <CategoryImage
                        src={hasImage ? item.thumbnail_img : NoImg}
                        alt={hasName ? item.category_name : "Category"}
                        priority={index < 8}
                      />
                    </div>
                  </div>

                  <h3 className="w-full text-[14px] sm:text-[14px] font-medium text-primary pt-1 sm:pt-2 text-center transition-colors duration-300 group-hover:text-[#CB843B] line-clamp-2 leading-tight min-h-[22px] sm:min-h-[26px] lg:min-h-[36px] flex items-start justify-center">
                    {hasName ? (
                      item.category_name
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        No name
                      </span>
                    )}
                  </h3>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* ── Infinite scroll loader (only on full /categories page) ── */}
      {!seeAllBtn && (
        <>
          <div ref={loaderRef} className="h-10 w-full" />

          {/* Loading skeleton */}
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
