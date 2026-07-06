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

// ── Below-the-fold: lazy (dynamic) imports ──
const Newest = dynamic(() => import("@/components/HomePage/FlashSale/Newest"));
const Popular = dynamic(
  () => import("@/components/HomePage/FlashSale/Popular"),
);
const Olds = dynamic(() => import("@/components/HomePage/FlashSale/Olds"));
const OfferBanner = dynamic(
  () => import("@/components/HomePage/OfferBanner/OfferBanner"),
);
const ClipToCart = dynamic(
  () => import("@/components/HomePage/ClipToCart/ClipToCart"),
);
const ShopBrand = dynamic(
  () => import("@/components/HomePage/ShopBrand/ShopBrand"),
);
const MostPopular = dynamic(
  () => import("@/components/HomePage/MostPopular/MostPopular"),
);
const FeatureProducts = dynamic(
  () => import("@/components/HomePage/FeatureProducts/FeatureProducts"),
);
const LatestBlog = dynamic(() => import("@/components/layout/LatestBlog"));
const ShopSelector = dynamic(
  () => import("@/components/HomePage/ShopSelector"),
);

// SLIDER DATA
const electronicsSlides: SlideItem[] = [
  {
    id: 1,
    title: "New Smartphones",
    content: "Up to 50% off on latest models",
    imageUrl: "/images/banner_1.png",
  },
  {
    id: 2,
    title: "Laptops & Computers",
    content: "Powerful performance for professionals",
    imageUrl: "/images/banner_2.png",
  },
  {
    id: 3,
    title: "Smart Watches",
    content: "Track your fitness journey",
    imageUrl: "/images/banner_1.png",
  },
  {
    id: 4,
    title: "New Smartphones",
    content: "Up to 50% off on latest models",
    imageUrl: "/images/banner_2.png",
  },
  {
    id: 5,
    title: "Laptops & Computers",
    content: "Powerful performance for professionals",
    imageUrl: "/images/banner_1.png",
  },
  {
    id: 6,
    title: "Smart Watches",
    content: "Track your fitness journey",
    imageUrl: "/images/banner_2.png",
  },
];

export default function Home() {

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

  return (
    <div>
      {/* HERO SLIDER  */}
      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto ">
        <BannerSlider
          slides={electronicsSlides}
          autoplayDelay={4500}
          navigation={true}
          pagination={true}
          slidesPerView={1.5}
        />
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
          <div className="flex flex-col flex-1  md:py-10 md:mt-10! max-w-355 mx-auto md:h-165">
            <div className="md:px-12.5 px-4 pb-4">
              <GlobalCountdown
                title="Flash Sale"
                targetDate="2026-06-10T23:59:59"
                pagesLink="/sale"
              />
              <GlobalTabs tabs={tabsData} />
            </div>
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner />
        </div>
      </Suspense>

      {/* Trending Now */}
      <Suspense fallback={<TrendingNowSkeleton />}>
        <div className="flex flex-col flex-1  lg:*:pb-10  max-w-355 mx-auto md:h-135 ">
          <div className="md:px-12.5 px-4">
            <div className="flex items-center gap-6 pb-5 justify-between">
              <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
                Trending Now
              </h3>
              <Link
                className="text-sm font-medium text-primary hover:underline"
                href="/trending-now"
              >
                See All
              </Link>
            </div>

            <GlobalTabs tabs={tabsData} />
          </div>
        </div>
      </Suspense>

      {/* Clip To Cart */}
      <Suspense fallback={<ClipToCartSkeleton />}>
        <div className="bg-[#E9CCAE] dark:bg-[#6d3f0e]">
          <div className="flex flex-col flex-1  py-10 mt-10! max-w-355 mx-auto md:px-12.5 px-4 ">
            <ClipToCart />
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner />
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
        <div className="bg-[#6D3F0E]">
          <div className="flex flex-col flex-1  py-10 mt-10! max-w-355 mx-auto md:h-165">
            <div className="md:px-12.5 px-4">
              <div className="flex items-center gap-6 pb-5">
                <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-white">
                  New Arrivals
                </h3>
              </div>
              <GlobalTabs tabs={tabsData} />
            </div>
          </div>
        </div>
      </Suspense>

      {/* Offer Banner */}
      <Suspense fallback={<OfferBannerSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner />
        </div>
      </Suspense>

      {/* Most Popular */}
      <Suspense fallback={<MostPopularSkeleton />}>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5">
          <MostPopular />
        </div>
      </Suspense>

      {/* Hot Deal of the Day */}
      <Suspense fallback={<HotDealSkeleton />}>
        <div className="bg-[#222222]">
          <div className="flex flex-col flex-1  py-10 mt-10! max-w-355 mx-auto">
            <div className="md:px-12.5 px-4">
              <div className="flex items-center gap-6 pb-5">
                <h3 className="md:text-[32px] text-[20px] font-bold transition-colors bg-linear-to-r from-white to-[#CB843B] text-transparent bg-clip-text hover:brightness-110 dark:text-white">
                  Hot Deal of the Day
                </h3>
              </div>
              <GlobalTabs tabs={tabsData} />
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
