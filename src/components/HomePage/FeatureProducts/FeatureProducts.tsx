import Link from "next/link";

import Image from "next/image";
import { api } from "@/lib/api";
import { sortInStockFirst } from "@/lib/sortProducts";
import FeatureProductGrid from "./FeatureProductGrid";

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
  endOfLife?: boolean;
  allowPreOrder?: boolean;
  recognitionBadge?: string;
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

export default async function FeatureProducts() {
  let products: ProductCardItem[] = [];
  let banners: WebBanner[] = [];

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      "/showcase-items?showcaseSlug=feature-products&limit=5",
      { next: { revalidate: 5 } },
    );

    const list = Array.isArray(res?.data) ? res.data : [];

    products = sortInStockFirst(list).map((item) => ({
      uuid: item.productUuid,
      title: item.productName,
      slug: item.productSlug,
      price: item.discountedPrice,
      originalPrice: item.regularPrice,
      discount: Math.round(item.disRate),
      badge: item.productBadge,
      isBestDeal: false,
      inStock: !item.isTba,
      image: item.thumbnails?.mediaFileUrl ?? "/images/product.png",
      isTba:            item.isTba,
      endOfLife:        item.endOfLife        ?? false,
      allowPreOrder:    item.allowPreOrder    ?? false,
      recognitionBadge: item.recognitionBadge ?? "",
    }));
  } catch (error) {
    console.error("Error fetching feature products SSR:", error);
  }

  try {
    const bannerRes = await api.get<WebBannerResponse>(
      "/web-banner/feature-products-below",
      { next: { revalidate: 5 } },
    );

    banners = Array.isArray(bannerRes?.data) ? bannerRes.data : [];
  } catch (error) {
    console.error("Error fetching feature-products-below banners SSR:", error);
  }

  const [primaryBanner, secondaryBanner] = banners;



  return (
    <div className=" px-4 lg:px-0">
      <div className="flex justify-between items-center">
        <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Feature Products
        </h3>
        <Link
          href="/feature-product"
          className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 "
        >
          See all
        </Link>
      </div>

      <FeatureProductGrid products={products} />

      {(primaryBanner || secondaryBanner) && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 mt-6 items-stretch cursor-pointer">
    {primaryBanner && (
      <div className="sm:col-span-1 lg:col-span-8 h-[300px] md:h-[600px]">
        <Link
          href={primaryBanner.mediaInfo || "#"}
          target={primaryBanner.openNewTab ? "_blank" : undefined}
          rel={
            primaryBanner.openNewTab ? "noopener noreferrer" : undefined
          }
        >
          <Image
            src={primaryBanner.imageURL}
            width={500}
            height={300}
            alt="Offer banner"
            loading="lazy"
            className="w-full h-[300px] md:h-[600px] object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </Link>
      </div>
    )}

    {secondaryBanner && (
      <div className="sm:col-span-1 lg:col-span-4 h-[300px] md:h-[600px]">
        <Link
          href={secondaryBanner.mediaInfo || "#"}
          target={secondaryBanner.openNewTab ? "_blank" : undefined}
          rel={
            secondaryBanner.openNewTab ? "noopener noreferrer" : undefined
          }
        >
          <Image
            src={secondaryBanner.imageURL}
            width={500}
            height={300}
            alt="Offer banner"
            loading="lazy"
            className="w-full h-[300px] lg:h-[600px] object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </Link>
      </div>
    )}
  </div>
)}

      {/* <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 justify-center mt-8 sm:mt-10">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#35291e] rounded-2xl w-full py-4 sm:py-6 lg:py-7 flex flex-col items-center gap-2 sm:gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: "0px 6px 45px 25px #E9CCAE24" }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#f5ede4] flex items-center justify-center">
              {feature.icon}
            </div>
            <p className="text-center text-[#4a3f35] dark:text-white text-[10px] sm:text-xs font-medium leading-snug px-1 sm:px-2 whitespace-pre-line">
              {feature.label}
            </p>
          </div>
        ))}
      </div> */}
    </div>
  );
}
