import TrendingNow from "./TrendingNow";
import { api } from "@/lib/api";
import GlobalTabs from "@/components/share/GlobalTabs";
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

export default async function TrendingNowSectionCom() {
  let products: ProductCardItem[] = [];

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      "/showcase-items?showcaseSlug=trending-now",
      { cache: "no-store" }
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
    console.error("Error fetching hot deal products SSR:", error);
  }

    const tabsData = [
      {
        label: "Newest",
        content: <TrendingNow products={products} />,
      },
      {
        label: "Popular",
        content: <TrendingNow products={products} />,
      }
    ];

  return (
    <div className="">
      <GlobalTabs tabs={tabsData} />
    </div>
  );
}