/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import NoImg from "@/images/no_images.png";
import { api } from "@/lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay, } from "swiper/modules";
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
        className="mySwiper w-full"
        >
          {displayCategories.map((item) => {
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
                  className="w-full flex flex-col items-center gap-2 group focus:outline-none cursor-pointer pb-5"
                >
                  {/* <div className=" bg-[#F5F5F5] rounded-4xl hover:bg-[#fcf5ed] hover:border-[#E9CCAE] border border-[#F5F5F5] relative w-full aspect-square p-3 md:p-8 transition-all duration-300 hover:scale-105"> */}

                  <div
                    className={`
                        w-full rounded-[28px] transition-all duration-300
    flex items-center justify-center p-3 sm:p-4
    bg-[#F5F5F5] border border-[#F5F5F5] shadow-sm
    dark:bg-[#342a20] dark:border-[#B57908]
    active:bg-[#fcf5ed] active:border-[#E9CCAE]
    md:hover:bg-[#fcf5ed] md:hover:border-[#E9CCAE]
                      `}
                  >
                    <div className="relative w-full aspect-square p-3 md:p-8 transition-all duration-300 hover:scale-105">
                      <Image
                        src={hasImage ? item.thumbnail_img : NoImg}
                        alt={hasName ? item.category_name : "Category"}
                        fill
                        sizes="(max-width: 768px) 25vw, 12vw"
                        className=" object-contain transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            (NoImg as any).src ?? NoImg.toString();
                        }}
                      />
                    </div>
                  </div>

                  <h2 className="w-full text-[14px] sm:text-[14px] font-medium text-primary pt-1 sm:pt-2 text-center transition-colors duration-300 group-hover:text-[#CB843B] line-clamp-2 leading-tight min-h-[22px] sm:min-h-[26px] lg:min-h-[36px] flex items-start justify-center">
                    {hasName ? (
                      item.category_name
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        No name
                      </span>
                    )}
                  </h2>
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

          {/* All loaded */}
          {/* {!hasMore && displayCategories.length > 0 && !isFetchingMore && (
            <p className="text-center text-xs text-gray-400 py-6">
              ✅ সব {displayCategories.length} টি ক্যাটাগরি দেখানো হয়েছে
            </p>
          )} */}
        </>
      )}
    </div>
  );
}

export default CategoriesCard;
