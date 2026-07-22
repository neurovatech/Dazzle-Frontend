/* eslint-disable react-hooks/purity */
import Link from "next/link";
import dynamic from "next/dynamic";
import BannerSlider, {
  SlideItem,
} from "@/components/HomePage/banner/Bannerslider";
import CategoriesSection from "@/components/HomePage/Categories/CategoriesSection";
import CategoriesSkeleton from "@/components/HomePage/Categories/CategoriesSkeleton";
import GlobalCountdown from "@/components/share/GlobalCountdown";
import GlobalTabs from "@/components/share/GlobalTabs";
import { Suspense } from "react";
import {
  FlashSaleSkeleton,
  OfferBannerSkeleton,
  TrendingNowSkeleton,
  ClipToCartSkeleton,
  ShopBrandSkeleton,
  NewArrivalsSkeleton,
  MostPopularSkeleton,
  HotDealSkeleton,
  FeatureProductsSkeleton,
  LatestBlogSkeleton,
} from "@/components/share/Skeletons";
import { api } from "@/lib/api";

// ── Below-the-fold: lazy (dynamic) imports ──
const Newest = dynamic(() => import("@/components/HomePage/FlashSale/Newest"));
const HotDealSectionCom = dynamic(
  () => import("@/components/HomePage/HotDeal/HotDealSectionCom"),
);
const Popular = dynamic(
  () => import("@/components/HomePage/FlashSale/Popular"),
);
const Olds = dynamic(() => import("@/components/HomePage/FlashSale/Olds"));
const OfferBanner = dynamic(
  () => import("@/components/HomePage/OfferBanner/OfferBanner"),
);
const OfferBannerFlash = dynamic(
  () => import("@/components/HomePage/OfferBanner/OfferBannerFlash"),
);

const ClipToCartSectionCom = dynamic(
  () => import("@/components/HomePage/ClipToCart/ClipToCartSectionCom"),
);
const ShopBrand = dynamic(
  () => import("@/components/HomePage/ShopBrand/ShopBrand"),
);

const NewArrivalsSectionCom = dynamic(
  () => import("@/components/HomePage/NewArrivals/NewArrivalsSectionCom"),
);

const FlashSaleSectionCom = dynamic(
  () => import("@/components/HomePage/FlashSale/FlashSaleSectionCom"),
);

const MostPopularSectionCom = dynamic(
  () => import("@/components/HomePage/MostPopular/MostPopularSectionCom"),
);
const FeatureProducts = dynamic(
  () => import("@/components/HomePage/FeatureProducts/FeatureProducts"),
);
const LatestBlog = dynamic(() => import("@/components/layout/LatestBlog"));
const ShopSelector = dynamic(
  () => import("@/components/HomePage/ShopSelector"),
);

async function getHeroBanners(): Promise<SlideItem[]> {
  try {
    const res = await api.get<unknown>("/web-banner/home-banner", {
      cache: "no-store",
    });

    let list: unknown[] = [];
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj?.data)) {
      list = obj.data;
    } else if (Array.isArray(res)) {
      list = res as unknown[];
    }
    return list.map((item, index) => {
      const b = item as Record<string, unknown>;
      return {
        id: index + 1,
        title: b.title ? String(b.title) : "",
        content: b.mediaInfo ? String(b.mediaInfo) : "",
        imageUrl: String(b.imageURL ?? ""),
        openNewTab: Boolean(b.openNewTab),
        mediaInfo: b.mediaInfo ? String(b.mediaInfo) : "",
      };
    });
  } catch (error) {
    console.error("Error fetching hero banners in Home SSR:", error);
    return [];
  }
}

export default async function Home() {
  const heroSlides = await getHeroBanners();
  const tabsData = [
    {
      label: "Newest",
      content: <Newest />,
    },
    {
      label: "Popular",
      content: <Popular />,
    },
    {
      label: "Olds",
      content: <Olds />,
    },
  ];
    function getNext15thDate() {
      const now = new Date();
      const currentDay = now.getDate();
      
      let targetMonth = now.getMonth();
      let targetYear = now.getFullYear();
      if (currentDay >= 15) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }
      
      const target = new Date(targetYear, targetMonth, 15, 23, 59, 59);
      return target.toISOString();
    }

  return (
    <div>
      {/* HERO SLIDER  */}
      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto px-0 sm:px-0">
        {heroSlides.length > 0 && (
          <BannerSlider
            slides={heroSlides}
            autoplayDelay={4500}
            navigation={true}
            pagination={true}
            slidesPerView={1.5}
          />
        )}
      </div>
      <div className="hidden">
        <ShopSelector />
      </div>

      {/* Categories  */}
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
      </div>

      {/* Flash Sale */}
      <Suspense fallback={<FlashSaleSkeleton />}>
        <div className="bg-[#6D3F0E]">
          <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto">
            <div className="px-3 sm:px-4 md:px-6 lg:px-12 pb-4">
              <GlobalCountdown
                title="Flash Sale"
                targetDate={getNext15thDate()}
                pagesLink="/offer/limited-time-offer"
              />
              <FlashSaleSectionCom />
              {/* <GlobalTabs tabs={tabsData} /> */}
            </div>
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner apiEndpoint="flash-sale-below" />
        </div>
      </Suspense>

      {/* Trending Now */}
      <Suspense fallback={<TrendingNowSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto">
          <div className="px-3 sm:px-4 md:px-6 lg:px-12">
            <div className="flex items-center gap-4 sm:gap-6 pb-4 sm:pb-5 justify-between pt-4 sm:pt-6">
              <h3 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
                Trending Now
              </h3>
              <Link
                className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 "
                href="/trending-now"
              >
                See All
              </Link>
            </div>

            {/* <GlobalTabs tabs={tabsData} /> */}
            <FlashSaleSectionCom />
          </div>
        </div>
      </Suspense>

      {/* Clip To Cart */}
      <Suspense fallback={<ClipToCartSkeleton />}>
        <div className="bg-[#E9CCAE] dark:bg-[#6d3f0e]">
          <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto px-3 sm:px-4 md:px-6 lg:px-12">
            <ClipToCartSectionCom />
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBannerFlash apiEndpoint="clip-to-cart-below" />
        </div>
      </Suspense>

      {/* Shop By Brand */}
      <Suspense fallback={<ShopBrandSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto">
          <ShopBrand />
        </div>
      </Suspense>

      {/* New Arrivals */}
      <Suspense fallback={<NewArrivalsSkeleton />}>
        <div>
          <div className="bg-[#6D3F0E]">
            <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto">
              <div className="px-3 sm:px-4 md:px-6 lg:px-12">
                <div className="flex items-center gap-4 sm:gap-6 pb-4 sm:pb-5 justify-between">
                  <h3 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold transition-colors text-white">
                    New Arrivals
                  </h3>

                  <Link
                    href="/new-arrivals"
                    className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 "
                  >
                    See all
                  </Link>
                </div>
                <NewArrivalsSectionCom />
                {/* <GlobalTabs tabs={tabsData} /> */}
              </div>
            </div>
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner apiEndpoint="new-arrivals-below" />
        </div>
      </Suspense>

      {/* Most Popular */}
      <Suspense fallback={<MostPopularSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5">
          <MostPopularSectionCom />
        </div>
      </Suspense>

      {/* Hot Deal of the Day */}
      <Suspense fallback={<HotDealSkeleton />}>
        <div className="bg-[#222222]">
          <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto">
            <div className="px-3 sm:px-4 md:px-6 lg:px-12">
              <div className="flex items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-5">
                <h3 className="text-[20px] sm:text-[24px] md:text-[32px] font-bold transition-colors bg-linear-to-r from-white to-[#CB843B] text-transparent bg-clip-text hover:brightness-110 dark:text-white">
                  Hot Deal of the Day
                </h3>

                <Link
                  href="/hot-deal"
                  className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 "
                >
                  See all
                </Link>
              </div>
              {/* <GlobalTabs tabs={tabsData} /> */}
              <HotDealSectionCom />
            </div>
          </div>
        </div>
      </Suspense>

      {/* Feature Products */}
      <Suspense fallback={<FeatureProductsSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 mt-10!">
          <FeatureProducts />
        </div>
      </Suspense>

      <Suspense fallback={<LatestBlogSkeleton />}>
        <div className="">
          <LatestBlog />
        </div>
      </Suspense>
    </div>
  );
}
