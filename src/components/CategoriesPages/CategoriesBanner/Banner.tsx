import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebBannerItem {
  bannerUUID: string;
  imageURL: string;
  mediaInfo: string;
  openNewTab: boolean;
}

interface BannerProps {
  banners: WebBannerItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

function Banner({ banners }: BannerProps) {
  if (!banners?.length) return null;

  const [banner1, banner2] = banners;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 -md:mt-3 items-stretch cursor-pointer md:px-12.5 px-4 mt-4 pb-6">
  {banner1 && (
    <div className="lg:col-span-3 h-[150px] md:h-[200px]">
      <Link
        href={banner1.mediaInfo || "#"}
        target={banner1.openNewTab ? "_blank" : undefined}
        rel={banner1.openNewTab ? "noopener noreferrer" : undefined}
      >
        <Image
          src={banner1.imageURL}
          width={500}
          height={300}
          alt="Banner"
          className="w-full h-[150px] md:h-[200px] object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
        />
      </Link>
    </div>
  )}

  {banner2 && (
    <div className="lg:col-span-9 h-[150px] md:h-[200px]">
      <Link
        href={banner2.mediaInfo || "#"}
        target={banner2.openNewTab ? "_blank" : undefined}
        rel={banner2.openNewTab ? "noopener noreferrer" : undefined}
      >
        <Image
          src={banner2.imageURL}
          width={500}
          height={300}
          alt="Banner"
          className="w-full h-[150px] md:h-[200px] object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
        />
      </Link>
    </div>
  )}
</div>
  );
}

export default Banner;