import Link from "next/link";
import ProductCard from "@/components/share/GlobalProductCard";
import Banner from "@/images/o_banner.png";
import Deals from "@/images/deals.png";
import Image from "next/image";
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

export default async function FeatureProducts() {
  let products: ProductCardItem[] = [];
  let banners: WebBanner[] = [];

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      "/showcase-items?showcaseSlug=feature-products&limit=5",
      { next: { revalidate: 60 } },
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
      isBestDeal: item.disRate > 15, // adjust threshold as needed, API has no direct flag
      inStock: !item.isTba,
      image: item.thumbnails?.mediaFileUrl ?? "/images/product.png",
    }));
  } catch (error) {
    console.error("Error fetching feature products SSR:", error);
  }

  try {
    const bannerRes = await api.get<WebBannerResponse>(
      "/web-banner/feature-products-below",
      { next: { revalidate: 60 } },
    );

    banners = Array.isArray(bannerRes?.data) ? bannerRes.data : [];
  } catch (error) {
    console.error("Error fetching feature-products-below banners SSR:", error);
  }

  const [primaryBanner, secondaryBanner] = banners;

  const features = [
    {
      label: "100% Genuine\nProducts",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Super fast\nDelivery",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.5 2a2.5 2.5 0 0 1 5 0c4 1.5 6 5 6 9a10 10 0 1 1-20 0c0-4 2-7.5 6-9a2.5 2.5 0 0 1 3 0z" />
          <line x1="12" y1="7" x2="10" y2="13" />
          <line x1="10" y1="13" x2="14" y2="13" />
          <line x1="14" y1="13" x2="12" y2="19" />
        </svg>
      ),
    },
    {
      label: "36 Months\nInstallments",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
      ),
    },
    {
      label: "2 Years\nReplacement",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="8" height="8" rx="1" />
          <rect x="14" y="13" width="8" height="8" rx="1" />
          <path d="M10 7h4l-4 4" />
          <path d="M14 17H10l4-4" />
        </svg>
      ),
    },
    {
      label: "2 Years\nWarranty",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-3-7 3V3a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      label: "2 Years\nExchange",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
  ];

  return (
    <div className=" px-4">
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

      <div className="grid gap-3 sm:gap-4 grid-cols-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-5">
        {products.map((product, i) => (
          <div key={i} className={i === 4 ? "hidden lg:block" : ""}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>

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
