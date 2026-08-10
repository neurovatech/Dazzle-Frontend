import FlashSale from "./FlashSale";
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

function mapToProductCard(list: ShowcaseItem[]): ProductCardItem[] {
  return list.map((item) => ({
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
}

async function fetchShowcase(endpoint: string): Promise<ProductCardItem[]> {
  try {
    const res = await api.get<ShowcaseItemsResponse>(endpoint, {
      cache: "no-store",
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return mapToProductCard(list);
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

export default async function FlashSaleSectionCom() {
  const [newestProducts, popularProducts] = await Promise.all([
    fetchShowcase("/showcase-items?showcaseSlug=flash-sale-newest"),
    fetchShowcase("/showcase-items?showcaseSlug=flash-sale-popular"),
  ]);

  const tabsData = [
    {
      label: "Newest",
      content: <FlashSale products={newestProducts} />,
    },
    {
      label: "Popular",
      content: <FlashSale products={popularProducts} />,
    },
  ];

  return (
    <div className="">
      <GlobalTabs tabs={tabsData} />
    </div>
  );
}