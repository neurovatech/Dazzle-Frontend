import Image from "next/image";
import Banner from "@/images/o_banner.png";
import { api } from "@/lib/api";

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

interface OfferBannerProps {
  apiEndpoint?: string;
}

export default async function OfferBanner({ apiEndpoint }: OfferBannerProps) {
  let banners: WebBanner[] = [];

  try {
    const bannerRes = await api.get<WebBannerResponse>(
      `/web-banner/${apiEndpoint}`,
      { cache: "no-store" },
    );
    console.log("bannerRes", bannerRes);

    banners = Array.isArray(bannerRes?.data) ? bannerRes.data : [];
  } catch (error) {
    console.error(
      `Error fetching ${apiEndpoint} banners SSR:`,
      error,
    );
  }

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2 py-6 cursor-pointer">
      {banners.map((banner, i) => (
        <div key={i} className="overflow-hidden rounded-xl">
          <Image
            src={banner?.imageURL}
            width={500}
            height={200}
            alt={banner?.bannerUUID}
            loading="lazy"
            className="w-full transition-all duration-500 hover:scale-105 hover:shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}