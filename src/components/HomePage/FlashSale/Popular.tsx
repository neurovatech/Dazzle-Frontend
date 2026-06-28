"use client";

import ProductCard from "@/components/share/GlobalProductCard";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
}

interface NewestProps {
  slides?: SlideItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function Popular({
  slides = [],
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: NewestProps) {
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(2);

  const products = [
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
  ];

  return (
    <div className="flex flex-wrap gap-6 w-full">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={products.length > currentSlidesPerView}
        navigation={products.length > currentSlidesPerView && navigation}
        pagination={
          products.length > currentSlidesPerView && pagination
            ? { clickable: true }
            : false
        }
        autoplay={
          products.length > currentSlidesPerView
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
              }
            : false
        }
        scrollbar={{ draggable: true }}
        slidesPerView={2}
        spaceBetween={6}
        onBreakpoint={(swiper, breakpointParams) => {
          setCurrentSlidesPerView(
            Number(breakpointParams.slidesPerView) || 2
          );
        }}
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
        className="mySwiper w-full"
      >
        {products.map((product, i) => (
          <SwiperSlide key={i}>
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Popular;