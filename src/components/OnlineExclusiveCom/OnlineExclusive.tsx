"use client";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Newest from "@/components/HomePage/FlashSale/Newest";
import OnlineExclusiveCom from "./OnlineExclusiveCom"
interface HeroBannerItem {
  bannerUUID: string;
  imageURL: string;
  mediaInfo?: string;
  openNewTab?: boolean;
}

interface HeroBannerApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: HeroBannerItem[];
}

interface BannerItem {
  bannerUUID: string;
  imageURL: string;
  mediaInfo?: string;
  openNewTab?: boolean;
}

interface BannerApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: BannerItem[];
}


interface ShowcaseItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  discountedPrice: number;
  regularPrice: number;
  disRate: number;
  productBadge?: string;
  isTba: boolean;
  thumbnails?: {
    mediaFileUrl: string;
  };
}

interface ShowcaseItemsResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: ShowcaseItem[];
}

interface ProductCardItem {
  uuid: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge?: string;
  isBestDeal: boolean;
  inStock: boolean;
  image: string;
}

function OnlineExclusive() {
  const { data: heroData, isLoading: heroLoading } =
    useQuery<BannerApiResponse>({
      queryKey: ["online-exclusive-hero-banner"],
      staleTime: 2 * 60 * 1000,
      queryFn: () =>
        api.get<BannerApiResponse>("/web-banner/online-exclusive-product-hero"),
    });

  const { data: belowData, isLoading: belowLoading } =
    useQuery<BannerApiResponse>({
      queryKey: ["online-exclusive-below-banner"],
      staleTime: 2 * 60 * 1000,
      queryFn: () =>
        api.get<BannerApiResponse>(
          "/web-banner/online-exclusive-product-below",
        ),
    });

  const { data: topData, isLoading: topLoading } = useQuery<BannerApiResponse>({
    queryKey: ["online-exclusive-top-banner"],
    staleTime: 2 * 60 * 1000,
    queryFn: () =>
      api.get<BannerApiResponse>("/web-banner/online-exclusive-product-top"),
  });

    // --- New: most-popular products query ---
  const { data: popularData, isLoading: popularLoading } =
    useQuery<ShowcaseItemsResponse>({
      queryKey: ["showcase-most-popular"],
      staleTime: 2 * 60 * 1000,
      queryFn: () =>
        api.get<ShowcaseItemsResponse>(
          "/showcase-items?showcaseSlug=oep-exclusive-product",
        ),
    });

  const popularList = Array.isArray(popularData?.data) ? popularData.data : [];

  const products: ProductCardItem[] = popularList.map((item) => ({
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

  const { data: popularDataTwo, isLoading: popularLoadingTwo } =
    useQuery<ShowcaseItemsResponse>({
      queryKey: ["showcase-most-popular"],
      staleTime: 2 * 60 * 1000,
      queryFn: () =>
        api.get<ShowcaseItemsResponse>(
          "/showcase-items?showcaseSlug=oep-best-selling",
        ),
    });

  const bsetSale = Array.isArray(popularDataTwo?.data) ? popularDataTwo.data : [];

  const bestproducts: ProductCardItem[] = bsetSale.map((item) => ({
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

  const { data: popularDataThree, isLoading: popularLoadingThree } =
    useQuery<ShowcaseItemsResponse>({
      queryKey: ["showcase-most-popular"],
      staleTime: 2 * 60 * 1000,
      queryFn: () =>
        api.get<ShowcaseItemsResponse>(
          "/showcase-items?showcaseSlug=oep-best-selling",
        ),
    });

  const daybsetSale = Array.isArray(popularDataThree?.data) ? popularDataThree.data : [];

  const daybestproducts: ProductCardItem[] = daybsetSale.map((item) => ({
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

  const heroBanner = heroData?.data?.[0];
  const belowBanners = belowData?.data ?? [];
  const topBanners = topData?.data ?? [];

  return (
    <div className="">
      <div className="bg-[#ebebeb] dark:bg-[#2e2b28]">
        <div className="flex flex-col flex-1 items-center max-w-355 mx-auto px-4 ">
          <div className="w-full pt-5">
            {heroLoading ? (
              <div className="w-full h-55 sm:h-75 md:h-121 animate-pulse bg-gray-200 dark:bg-zinc-800 rounded-[15px]" />
            ) : heroBanner?.imageURL ? (
              heroBanner.mediaInfo && heroBanner.mediaInfo !== "#" ? (
                <Link
                  href={heroBanner.mediaInfo}
                  target={heroBanner.openNewTab ? "_blank" : undefined}
                  rel={
                    heroBanner.openNewTab ? "noopener noreferrer" : undefined
                  }
                >
                  <Image
                    src={heroBanner.imageURL}
                    width={500}
                    height={500}
                    className="w-full!"
                    alt="Online exclusive banner"
                  />
                </Link>
              ) : (
                <Image
                  src={heroBanner.imageURL}
                  width={500}
                  height={500}
                  className="w-full!"
                  alt="Online exclusive banner"
                />
              )
            ) : null}
            <div className="bg-black text-white flex justify-evenly items-center text-center gap-x-2 rounded-full md:rounded-xl md:max-w-3xl mx-auto py-1 md:py-2 px-3 md:px-10 font-semibold text-[10px] md:text-base my-6">
              <p>Delivery:</p>
              <p className="gradient-text">1-3 days</p>

              <span className="h-7 md:h-6 bg-gray-500 w-px"></span>
              <div>
                <p className="gradient-text">3-7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto pt-4 px-4">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4 w-full">
          {topBanners.map((banner) => (
            <Link
              key={banner.bannerUUID}
              className="w-full shadow-lg transition-all duration-500 hover:shadow-2xl"
              href={banner.mediaInfo || ""}
              target={banner.openNewTab ? "_blank" : undefined}
              rel={banner.openNewTab ? "noopener noreferrer" : undefined}
            >
              <Image
                src={banner.imageURL}
                width={500}
                height={500}
                className="w-full!"
                alt="Picture of the author"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Online Exclusive Products
          </h3>
          {/* <Link href="/product" className="">
            See all
          </Link> */}
        </div>
        <OnlineExclusiveCom products={products} />
        {/* <Newest /> */}
      </div>

      <div className="flex flex-col flex-1 items-center max-w-355 mx-auto pt-4 px-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          {belowLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-40 sm:h-60 md:h-70 animate-pulse bg-gray-200 dark:bg-zinc-800 rounded-[15px]"
                />
              ))
            : belowBanners.map((banner) =>
                banner.mediaInfo && banner.mediaInfo !== "#" ? (
                  <Link
                    key={banner.bannerUUID}
                    href={banner.mediaInfo}
                    target={banner.openNewTab ? "_blank" : undefined}
                    rel={banner.openNewTab ? "noopener noreferrer" : undefined}
                    className="shadow-lg transition-all duration-500 hover:shadow-2xl"
                  >
                    <Image
                      src={banner.imageURL}
                      width={500}
                      height={500}
                      className="w-full!"
                      alt="Online exclusive product banner"
                    />
                  </Link>
                ) : (
                  <div
                    key={banner.bannerUUID}
                    className="shadow-lg transition-all duration-500 hover:shadow-2xl"
                  >
                    <Image
                      src={banner.imageURL}
                      width={500}
                      height={500}
                      className="w-full!"
                      alt="Online exclusive product banner"
                    />
                  </div>
                ),
              )}
        </div>
      </div>

      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Best Selling Items
          </h3>
          <Link href="/product" className="">
            See all
          </Link>
        </div>
        <OnlineExclusiveCom products={bestproducts} />
      </div>
      <div className="max-w-355 mx-auto pt-6 px-4 e_slider">
        <div className="flex justify-between items-center pb-4 ">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            {" "}
            Deals of the Day
          </h3>
          <Link href="/product" className="">
            See all
          </Link>
        </div>
        <OnlineExclusiveCom products={daybestproducts} />
      </div>
    </div>
  );
}

export default OnlineExclusive;
