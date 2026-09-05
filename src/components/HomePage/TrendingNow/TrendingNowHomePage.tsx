"use client";
import ProductCard from "@/components/share/GlobalProductCard";
import type { ProductCardItem } from "./TrendingNowSectionCom";
import { useHomeProductFocus } from "@/hooks/useHomeProductFocus";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface TrendingNowProps {
  products: ProductCardItem[];
  autoplayDelay?: number;
  pagination?: boolean;
}

/**
 * Same Swiper configuration as the homepage's Flash Sale slider — this
 * section used a slightly different loop threshold and spacing before, which
 * made it feel like a different widget even though it is the same kind of
 * product carousel. Kept in sync deliberately rather than each section
 * carrying its own slightly-different numbers.
 */
function TrendingNowHomePage({
  products,
  autoplayDelay = 3000,
  pagination = true,
}: TrendingNowProps) {
  useHomeProductFocus("home_trending_now");

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Trending Now products available.
      </p>
    );
  }

  return (
    <div className="relative flex flex-wrap gap-6">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={products.length >= 10}
        pagination={pagination ? { clickable: true } : false}
        autoplay={
          autoplayDelay
            ? { delay: autoplayDelay, disableOnInteraction: false }
            : undefined
        }
        scrollbar={{ draggable: true }}
        slidesPerView={2}
        spaceBetween={4}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 6,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 4,
          },
        }}
        className="mySwiper w-full"
      >
        {products.map((product, i) => (
          <SwiperSlide key={product.uuid || i}>
            <ProductCard
              productUuid={product.uuid}
              slug={product.slug}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              badge={product.badge}
              isBestDeal={false}
              inStock={product.inStock}
              image={product.image}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default TrendingNowHomePage;
