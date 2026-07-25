/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

interface ShowcaseItem {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: ShowcaseThumbnail;
}

interface ShowcaseItemsResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ShowcaseItem[];
}

export interface ProductCardItem {
  uuid: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  isBestDeal: boolean;
  inStock: boolean;
  image: string;
}

interface WebBanner {
  bannerUUID: string;
  imageURL: string;
  mediaInfo: string;
  openNewTab: boolean;
}

interface WebBannerResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: WebBanner[];
}
interface MostPopularProps {
  products: ProductCardItem[];
  banners: WebBanner[];
  autoplayDelay?: number;
  navigation?: boolean;
}

function MostPopular({
  products,
  banners,
  autoplayDelay = 3000,
  navigation = true,
}: MostPopularProps) {
  console.log(products, "productsproductsproductsproducts");

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 grid-cols-2 mt-5">
        {products.map((product, i) => (
          <div key={i} className={i === 4 ? "hidden lg:block" : ""}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      <div className="pt-6">
        <Swiper
          modules={[Navigation, Scrollbar, A11y, Autoplay]}
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
          {banners.map((banner, i) => (
            <SwiperSlide key={i}>
              <Link href={banner.mediaInfo || "#"} className="">
                <Image
                  src={banner.imageURL}
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
    </div>
  );
}

export default MostPopular;
