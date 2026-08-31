"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { api } from "@/lib/api";
import ReelModal from "./ReelModal";
import ClipToCartCard from "./ClipToCartCard";
import {
  clipEndpoint,
  mapClipProduct,
  type ClipApiResponse,
  type ClipProduct,
} from "./clipToCart.shared";

/**
 * Homepage "Clip to Cart" strip.
 *
 * Keeps the carousel — it is one section among many on the homepage, so it has
 * to stay short. The dedicated /clip-to-cart page shows the same cards in a
 * full grid instead.
 *
 * The card and the reel viewer come from the shared components, so this strip
 * and the page cannot drift apart.
 */
function ClipToCart({
  autoplayDelay = 3000,
  pagination = true,
}: {
  autoplayDelay?: number;
  pagination?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isLoading } = useQuery<ClipApiResponse>({
    queryKey: ["showcase-clip-to-cart"],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () => api.get<ClipApiResponse>(clipEndpoint(1)),
  });

  const products: ClipProduct[] = data?.data?.map(mapClipProduct) ?? [];

  if (isLoading && products.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center gap-6 pb-5">
          <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
            Clip to Cart
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-2xl h-[350px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h3>
        <Link
          href="/clip-to-cart"
          className="text-sm font-medium text-primary bg-orange-50 border border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28] hover:underline hover:text-[#CB843B]! transition-colors duration-300"
        >
          See All
        </Link>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          loop={products.length > 5}
          pagination={pagination ? { clickable: true } : false}
          autoplay={
            autoplayDelay
              ? { delay: autoplayDelay, disableOnInteraction: false }
              : undefined
          }
          scrollbar={{ draggable: true }}
          slidesPerView={1.2}
          spaceBetween={10}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 10 },
          }}
          className="mySwiper"
        >
          {products.map((product, i) => (
            <SwiperSlide key={product.id} className="h-auto">
              <ClipToCartCard
                product={product}
                index={i}
                onOpenModal={(idx) => {
                  setSelectedIndex(idx);
                  setModalOpen(true);
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <ReelModal
        isOpen={modalOpen}
        initialIndex={selectedIndex}
        products={products}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default ClipToCart;
