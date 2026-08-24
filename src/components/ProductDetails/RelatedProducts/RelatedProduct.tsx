"use client";
import ProductCard from "@/components/share/GlobalProductCard";
import type { ProductCardItem } from "./RelatedProductSectionCom";

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

interface HotDealComProps {
  products: ProductCardItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function RelatedProduct({
  products,
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: HotDealComProps) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No  products available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-6">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={true}
        pagination={pagination ? { clickable: true } : false}
        navigation={navigation}
        autoplay={false}
        // autoplay={
        //   autoplayDelay
        //     ? { delay: autoplayDelay, disableOnInteraction: false }
        //     : undefined
        // }
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
        className="mySwiper"
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
    </div>
  );
}

export default RelatedProduct;