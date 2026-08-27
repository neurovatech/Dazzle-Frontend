"use client";
import { useRef } from "react";
import ProductCard from "@/components/share/GlobalProductCard";
import type { ProductCardItem } from "./FlashSaleSectionCom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HotDealComProps {
  products: ProductCardItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function FlashSale({
  products,
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: HotDealComProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Flash Sale products available.
      </p>
    );
  }

  console.log(products, "productsproductsproductsproductsproducts")
 

  return (
    <div className="relative flex flex-wrap gap-6">
      {/* Left Arrow */}
      {/* {navigation && (
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-[-10px] top-[45%] -translate-y-1/2 -translate-x-2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-[#D4A97A] hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )} */}

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={products.length >= 10}
        pagination={pagination ? { clickable: true } : false}
        autoplay={true}
        scrollbar={{ draggable: true }}
        slidesPerView={2}
        spaceBetween={6}
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
            spaceBetween: 10,
          },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="mySwiper w-full"
      >
        {products.map((product, i) => (
          <SwiperSlide key={i}>
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


      {/* {navigation && (
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-[-10px] top-[45%] -translate-y-1/2 translate-x-2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-[#D4A97A] hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )} */}
    </div>
  );
}

export default FlashSale;