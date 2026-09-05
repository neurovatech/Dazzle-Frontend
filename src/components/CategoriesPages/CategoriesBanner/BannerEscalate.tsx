"use client";

/**
 * BannerEscalate
 *
 * Fetches /banner-escalate/{slug}?{param}=1 and shows a Swiper slider.
 * Each slide shows ONE image (slidesPerView=1).
 *
 * param priority:
 *   activeBrandSlug present → slug = brandSlug,   param = "brand"
 *   otherwise               → slug = categorySlug, param = queryParam ("category" | "subCategory")
 *
 * Hidden when the API returns an empty array.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BannerItem {
  fileUUID:        string;
  foreignUUID:     string;
  objectIdentifier: string;
  mediaFileOrder:  number;
  mediaFileURL:    string;
  navigateToUrl:   string;
}

interface BannerEscalateResponse {
  statusCode: number;
  status:     string;
  found:      boolean;
  count:      number;
  data:       BannerItem[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Base slug — category, subcategory, or brand slug */
  categorySlug:    string;
  queryParam?:     "category" | "subCategory";
  activeBrandSlug?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BannerEscalate({
  categorySlug,
  queryParam = "category",
  activeBrandSlug,
}: Props) {
  const showcaseSlug  = activeBrandSlug?.trim() || categorySlug;
  const showcaseParam = activeBrandSlug?.trim() ? "brand" : queryParam;

  const { data, isLoading } = useQuery<BannerEscalateResponse>({
    queryKey: ["banner-escalate", showcaseSlug, showcaseParam],
    queryFn: () =>
      api.get<BannerEscalateResponse>(
        `/banner-escalate/${showcaseSlug}?${showcaseParam}=1`,
        { cache: "no-store" },
      ),
    staleTime: 5 * 60 * 1000,
    gcTime:    30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:   false,
  });

  console.log(`/banner-escalate/${showcaseSlug}?${showcaseParam}=1`, "99999", data)

  const banners = data?.data ?? [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full h-[120px] sm:h-[160px] md:h-[200px] animate-pulse bg-gray-100 dark:bg-[#2a2420] rounded-2xl mb-4" />
    );
  }

  // Empty → render nothing
  if (!banners.length) return null;

  // Single banner — no need for swiper
  if (banners.length === 1) {
    const b = banners[0];
    return (
      <div className="w-full mb-4">
        <Link href={b.navigateToUrl || "#"}>
          <Image
            src={b.mediaFileURL}
            alt="Banner"
            width={1200}
            height={300}
            className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover rounded-2xl transition-all duration-500 hover:shadow-lg"
            priority
          />
        </Link>
      </div>
    );
  }

  // Multiple banners — Swiper slider, 1 slide at a time
  return (
    <div className="w-full mb-4">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={0}
        loop={banners.length >= 2}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="rounded-2xl overflow-hidden"
      >
        {banners
          .sort((a, b) => a.mediaFileOrder - b.mediaFileOrder)
          .map((b) => (
            <SwiperSlide key={b.fileUUID}>
              <Link href={b.navigateToUrl || "#"}>
                <Image
                  src={b.mediaFileURL}
                  alt="Banner"
                  width={1200}
                  height={300}
                  className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover"
                  priority={b.mediaFileOrder === 1}
                />
              </Link>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
