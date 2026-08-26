import NewArrivals from "./NewArrivals";
import { api } from "@/lib/api";
import NoImg from "@/images/no_images.png";
import GlobalTabs from "@/components/share/GlobalTabs";
import { sortInStockFirst } from "@/lib/sortProducts";

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
    isBestDeal: false,
    inStock: !item.isTba,
    image: item.thumbnails?.mediaFileUrl ?? NoImg,
  }));
}

async function fetchShowcase(endpoint: string): Promise<ProductCardItem[]> {
  try {
    const res = await api.get<ShowcaseItemsResponse>(endpoint, {
      next: { revalidate: 60 },
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return mapToProductCard(sortInStockFirst(list));
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

export default async function NewArrivalsSectionCom() {
  const [newestProducts, popularProducts] = await Promise.all([
    fetchShowcase("/products?latest=1"),
    fetchShowcase("/products?new-arrivals-popular=1"),
  ]);

  const tabsData = [
    {
      label: "Newest",
      content: <NewArrivals products={newestProducts} />,
    },
    {
      label: "Popular",
      content: <NewArrivals products={popularProducts} />,
    },
  ];

  return (
    <div className="">
      <GlobalTabs tabs={tabsData} />
    </div>
  );
}