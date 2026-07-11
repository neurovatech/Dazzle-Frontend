import React from "react";
import MostPopular from "./MostPopular";
import Link from "next/link";
import { api } from "@/lib/api";

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

export default async function MostPopularSectionCom() {
  let products: ProductCardItem[] = [];
  let banners: WebBanner[] = [];

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      "/showcase-items?showcaseSlug=most-popular&limit=5",
      { cache: "no-store" },
    );

    const list = Array.isArray(res?.data) ? res.data : [];

    products = list.map((item) => ({
      uuid: item.productUuid,
      title: item.productName,
      slug: item.productSlug,
      price: item.discountedPrice,
      originalPrice: item.regularPrice,
      discount: Math.round(item.disRate),
      badge: item.productBadge,
      isBestDeal: item.disRate > 15, 
      inStock: !item.isTba,
      image: item.thumbnails?.mediaFileUrl ?? "/images/product.png",
    }));
  } catch (error) {
    console.error("Error fetching feature products SSR:", error);
  }

  try {
    const bannerRes = await api.get<WebBannerResponse>(
      "/web-banner/most-popular-below",
      { cache: "no-store" },
    );

    banners = Array.isArray(bannerRes?.data) ? bannerRes.data : [];
  } catch (error) {
    console.error("Error fetching most-popular-below banners SSR:", error);
  }

  return (
    <div>
      <div className=" px-4">
        <div className="flex justify-between items-center ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            Most Popular
          </h3>
          <Link href="/most-popular" className="">
            See all
          </Link>
        </div>
        <MostPopular
            products={products}
            banners={banners}
        />
      </div>
    </div>
  );
}
