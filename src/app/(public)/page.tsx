/* eslint-disable react-hooks/purity */
import type { Metadata } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo-config";

/*
 * The home page advertises itself differently from the rest of the site:
 * og:site_name is the domain and og:locale is en_US here, whereas every other
 * route uses SITE_NAME ("Dazzle") and OG_LOCALE ("en_BD"). Kept local so the
 * shared constants — and therefore every other page — stay untouched.
 */
const HOME_OG_SITE_NAME = "dazzle.com.bd";
const HOME_OG_LOCALE = "en_US";

import Link from "next/link";
import dynamic from "next/dynamic";
import BannerSlider, {
  SlideItem,
} from "@/components/HomePage/banner/Bannerslider";
import CategoriesSection from "@/components/HomePage/Categories/CategoriesSection";
import GlobalCountdown from "@/components/share/GlobalCountdown";
import { api } from "@/lib/api";

// NOTE: the sections below used to be wrapped in <Suspense fallback={<…Skeleton/>}>.
// This page is statically generated (ISR, revalidate 60), and with those
// boundaries the prerendered HTML still shipped every skeleton in place and the
// real content at the very END of the document, swapped in by 13 `$RC` scripts
// — on slow mobile that swap moved everything below it (the homepage's
// ~0.27 CLS in Lighthouse). Without the boundaries the finished sections are
// simply in the HTML in order, so nothing has to be swapped or moved.

// ── Below-the-fold: lazy (dynamic) imports ──
// (Newest/Popular/Olds were removed: they were only referenced by a `tabsData`
//  array feeding a <GlobalTabs> that has been commented out on every usage.)
const HotDealSectionCom = dynamic(
  () => import("@/components/HomePage/HotDeal/HotDealSectionCom"),
);
const OfferBanner = dynamic(
  () => import("@/components/HomePage/OfferBanner/OfferBanner"),
);
const OfferBannerFlash = dynamic(
  () => import("@/components/HomePage/OfferBanner/OfferBannerFlash"),
);

const ClipToCartSectionCom = dynamic(
  () => import("@/components/HomePage/ClipToCart/ClipToCartSectionCom"),
);
const ShopBrandSectionCom = dynamic(
  () => import("@/components/HomePage/ShopBrand/ShopBrandSectionCom"),
);

const NewArrivalsSectionCom = dynamic(
  () => import("@/components/HomePage/NewArrivals/NewArrivalsSectionCom"),
);

const FlashSaleSectionCom = dynamic(
  () => import("@/components/HomePage/FlashSale/FlashSaleSectionCom"),
);

const TrendingNowSectionCom = dynamic(
  () => import("@/components/HomePage/TrendingNow/TrendingNowSectionCom"),
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

// ─── Home page metadata ───────────────────────────────────────────────────────

/**
 * The home page's own SEO copy.
 *
 * Deliberately NOT taken from site-settings. That endpoint returns
 * metaTitle: "Dazzle" — a brand name, not a page title — and it was overwriting
 * the descriptive title this page is supposed to rank on. Product, category and
 * brand pages still read their metadata from the API; only the home page, whose
 * copy is fixed editorial content, is pinned here.
 */
const HOME_TITLE =
  "Best Mobile, Laptop and Gadget Shop in Bangladesh ";
const HOME_DESCRIPTION =
  "Dazzle is the leading and top rated smartphone, laptops, tablets, and accessories selling shop in Bangladesh. Buy the latest tech products at the lowest price";
const HOME_KEYWORDS = "Best Smartphone shop in Bangladesh";

const HOME_OG_IMAGE = {
  url: absoluteUrl("/og.png"),
  width: 800,
  height: 600,
  alt: HOME_TITLE,
};

/**
 * Metadata for the home page only.
 *
 * Defined here rather than in the root layout because the layout's block is
 * inherited by every route, and two things below must NOT be: the robots
 * directives, and the site-name/locale values, which differ from the ones the
 * rest of the site uses.
 */
export async function generateMetadata(): Promise<Metadata> {
  const title = HOME_TITLE;
  const description = HOME_DESCRIPTION;
  const keywords = HOME_KEYWORDS;

  const ogImage = { ...HOME_OG_IMAGE, alt: title };

  return {
    // `absolute` bypasses the layout's "%s " template, which would
    // otherwise render this title with the brand appended a second time.
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: SITE_URL },

    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: HOME_OG_SITE_NAME,
      locale: HOME_OG_LOCALE,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

async function getHeroBanners(): Promise<SlideItem[]> {
  try {
    const res = await api.get<unknown>("/web-banner/home-banner", {
      next: { revalidate: 60 },
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
    <div className="bg-[#fffbf6] dark:bg-[#2e2b28]">
      {/* The page's single <h1>. Visually hidden because the design leads with
          the hero banner rather than a headline, but screen readers, search
          engines and agentic browsers all need one top-level heading that says
          what this page is — previously the homepage's only h1 was the
          "Categories" section title, which mis-describes the page. */}
      <h1 className="sr-only">
        Dazzle — Buy Mobiles, Laptops &amp; Gadgets Online in Bangladesh
      </h1>

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
      {/* Shop Selector — floating button + modal */}
      <ShopSelector />

      {/* Categories  */}
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <>
          <CategoriesSection />
        </>
      </div>

      {/* Flash Sale */}
      <>
        <div className="bg-[#6D3F0E]">
          <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto">
            <div className="px-3 sm:px-4 md:px-6 lg:px-12 pb-4">
              <GlobalCountdown
                title="Flash Sale"
                targetDate={getNext15thDate()}
                pagesLink="/offer/limited-time-offer"
              />
              <FlashSaleSectionCom />
            </div>
          </div>
        </div>
      </>


      {/* Offer Banner */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner apiEndpoint="flash-sale-below" />
        </div>
      </>


      {/* Trending Now */}
      <>
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

            <TrendingNowSectionCom />
          </div>
        </div>
      </>


      {/* Clip To Cart */}
      <>
        <div className="bg-[#E9CCAE] dark:bg-[#6d3f0e]">
          <div className="flex flex-col flex-1 py-6 sm:py-8 md:py-10 mt-6 sm:mt-8 md:mt-10! max-w-355 mx-auto px-3 sm:px-4 md:px-6 lg:px-12">
            <ClipToCartSectionCom />
          </div>
        </div>
      </>


      {/* Offer Banner */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBannerFlash apiEndpoint="clip-to-cart-below" />
        </div>
      </>


      {/* Shop By Brand */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto">
          <ShopBrandSectionCom />
        </div>
      </>


      {/* New Arrivals */}
      <>
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
              </div>
            </div>
          </div>
        </div>
      </>


      {/* Offer Banner */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4">
          <OfferBanner apiEndpoint="new-arrivals-below" />
        </div>
      </>


      {/* Most Popular */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5">
          <MostPopularSectionCom />
        </div>
      </>


      {/* Hot Deal of the Day */}
      <>
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
              <HotDealSectionCom />
            </div>
          </div>
        </div>
      </>


      {/* Feature Products */}
      <>
        <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 mt-10!">
          <FeatureProducts />
        </div>
      </>


      <>
        <div className="">
          <LatestBlog />
        </div>
      </>

    </div>
  );
}
