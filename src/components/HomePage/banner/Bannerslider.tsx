"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
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
import "./banner.css";
import MarqueeBulletinBar from "../MarqueeBulletinBar";

export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
  openNewTab?: boolean;
  mediaInfo?: string;
}

interface BannerSliderProps {
  slides?: SlideItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function Bannerslider({
  slides = [],
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: BannerSliderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const finalSlides =
    slides.length > 0
      ? slides
      : [
          { id: 1, title: "Slide 1", content: "Demo Content 1" },
          { id: 2, title: "Slide 2", content: "Demo Content 2" },
          { id: 3, title: "Slide 3", content: "Demo Content 3" },
        ];

  if (!mounted) {
    return (
      <div className="w-full pb-4 md:pb-6 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="">
          <MarqueeBulletinBar />
        </div>
        <div className="w-full h-55 sm:h-75 md:h-121 animate-pulse bg-gray-200 dark:bg-zinc-800 rounded-[15px]" />
      </div>
    );
  }

  return (
    <div className="w-full pb-4 md:pb-6 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="">
        <MarqueeBulletinBar />
      </div>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={true}
        pagination={pagination ? { clickable: true } : false}
        navigation={navigation}
        autoplay={
          autoplayDelay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                reverseDirection: true,
              }
            : undefined
        }
        scrollbar={{ draggable: true }}
        slidesPerView={1}
        spaceBetween={12}
        breakpoints={{
          768: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 1.5,
            spaceBetween: 24,
          },
        }}
        className="mySwiper"
      >
        {finalSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {slide.imageUrl ? (
              <Link
                href={(slide.content as string) || "#"}
                target={slide.openNewTab ? "_blank" : undefined}
                rel={slide.openNewTab ? "noopener noreferrer" : undefined}
                className="relative w-full h-60 max-[450px]:h-50 sm:h-75 md:h-110 rounded-[15px] overflow-hidden block"
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || `Slide ${slide.id}`}
                  fill
                  className="object-cover"
                  // NOT 100vw: at the md+ breakpoint Swiper shows slidesPerView=1.5,
                  // so one slide is only ~2/3 of the (max-w-355 = 1420px-capped)
                  // container width — ~936px at desktop, matching what Lighthouse
                  // measured. Below 768px there's 1 slide per view, so it IS ~100vw.
                  sizes="(max-width: 767px) 100vw, (max-width: 1420px) 66vw, 936px"
                  priority={slide.id === finalSlides[0]?.id}
                />
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-55 sm:h-75 md:h-105 lg:h-125 bg-blue-100 text-blue-900 rounded-[15px] border border-blue-200 px-4 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                  {slide.title}
                </h2>
                <div className="text-base sm:text-lg md:text-xl">
                  {slide.content}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Bannerslider;