"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

export interface Job {
  id: number;
  category: string;
  date: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

interface CareerSliderProps {
  jobs: Job[];
}

export default function CareerSlider({ jobs }: CareerSliderProps) {
  return (
    <div className="relative">
      {/* Custom Navigation */}
      <button className="job-prev text-lg absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:text-black shadow-md transition">
        ❮
      </button>

      <button className="job-next text-lg absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:text-black shadow-md transition">
        ❯
      </button>

      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: ".job-prev",
          nextEl: ".job-next",
        }}
        slidesPerView={3}
        spaceBetween={24}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="mySwiper"
      >
        {jobs.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="group rounded-xl border border-gray-200 bg-white dark:bg-[#393430] p-6 transition-all duration-300">
              {/* Image */}
              <div className="flex justify-center">
                <div className="overflow-hidden rounded-md h-[240px] w-[180px] relative">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="180px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
                <span>{slide.category}</span>
                <span className="h-4 w-[1px] bg-gray-300" />
                <span>{slide.date}</span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-xl font-semibold text-[#222222] dark:text-white">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="mt-1 text-sm text-[#aaaaaa]">
                {slide.description}
              </p>

              {/* Button */}
              <Link href={`/career/${slide.slug}`}>
                <button className="mt-7 inline-flex items-center gap-2 font-bold uppercase tracking-wide text-black dark:text-white transition hover:gap-3">
                  See More
                  <span>❯</span>
                </button>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
