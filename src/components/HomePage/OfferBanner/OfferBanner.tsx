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
      { next: { revalidate: 60 } },
    );

    banners = Array.isArray(bannerRes?.data) ? bannerRes.data : [];
  } catch (error) {
    console.error(
      `Error fetching ${apiEndpoint} banners SSR:`,
      error,
    );
  }

  return (
    <div className="grid md:grid-cols-2 grid-cols-2 md:gap-4 gap-2 py-6 cursor-pointer">
      {banners.map((banner, i) => (
        <div key={i} className="overflow-hidden rounded-xl">
          <Image
            src={banner?.imageURL}
            width={500}
            height={200}
            alt={banner?.bannerUUID}
            loading="lazy"
            // Always a 2-column grid at every breakpoint (grid-cols-2 /
            // md:grid-cols-2), so each banner never renders wider than half
            // the viewport. Without this, Next.js assumes 100vw and serves
            // an oversized candidate from its srcset — confirmed live via
            // PageSpeed Insights (this image alone: 37.5 KiB fetched for a
            // ~186px-wide slot, ~36 KiB of avoidable transfer).
            sizes="50vw"
            // h-auto is required alongside w-full here: without it the
            // browser has no way to reserve this image's box before the
            // real file loads (width comes from CSS, height stays at the
            // fixed 200 attribute), which is exactly what Lighthouse flags
            // as an "unsized image element" — confirmed live via PageSpeed
            // Insights as ~99% of this page's entire CLS score (0.271 of
            // 0.273). w-full + h-auto lets the browser compute the correct
            // reserved height from the declared 500x200 ratio immediately,
            // with no visual change once the image has loaded.
            className="w-full h-auto transition-all duration-500 hover:scale-105 hover:shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}