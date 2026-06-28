"use client";
import Link from "next/link";
import ProductCard from "@/components/share/GlobalProductCard";
import Image from "next/image";
import Deals from "@/images/deals.png";

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

interface ClipToCartProps {
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function MostPopular({
  // slides = [],
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: ClipToCartProps) {
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
    {
      title: "Sony WH-1000XM5 Noise Cancelling Headphones",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      badge: "Limited",
      isBestDeal: true,
      inStock: false,
      image: "/images/product.png",
    },
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
    <div className=" px-4">
      <div className="flex justify-between items-center ">
        <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Most Popular
        </h3>
        <Link href="#" className="">
          See all
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-5 grid-cols-2 mt-5">
        {products.map((product, i) => (
          <div key={i}>
            <ProductCard key={i} {...product} />
          </div>
        ))}
      </div>

      <div className="pt-6">
        <Swiper
        modules={[Navigation,  Scrollbar, A11y, Autoplay]}
        loop={true}
        // pagination={pagination ? { clickable: true } : false}
        navigation={navigation}
        autoplay={
          autoplayDelay
            ? { delay: autoplayDelay, disableOnInteraction: false }
            : undefined
        }
        scrollbar={{ draggable: true }}
        slidesPerView={2}
        spaceBetween={8}
        breakpoints={{
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
            spaceBetween: 10,
          },
        }}
        className="mySwiper"
      >
        {products.map((product, i) => (
          <SwiperSlide key={i}>
            <Link href="#" className="">
              <Image
                src={Deals}
                width={500}
                height={500}
                alt="Offer banner"
                className="w-full transition-all duration-500 hover:shadow-lg"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>

      {/* <div className="grid lg:gap-4 gap-2 md:grid-cols-3 grid-cols-3 mt-10">
        <Link href="#" className="">
          <Image
            src={Deals}
            width={500}
            height={500}
            alt="Offer banner"
            className="w-full transition-all duration-500 hover:shadow-lg"
          />
        </Link>
        <Link href="#" className="">
          <Image
            src={Deals}
            width={500}
            height={500}
            alt="Offer banner"
            className="w-full transition-all duration-500 hover:shadow-lg"
          />
        </Link>
        <Link href="#" className="">
          <Image
            src={Deals}
            width={500}
            height={500}
            alt="Offer banner"
            className="w-full transition-all duration-500 hover:shadow-lg"
          />
        </Link>
      </div> */}
    </div>
  );
}

export default MostPopular;
