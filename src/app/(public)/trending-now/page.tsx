import Breadcrumb from "@/components/share/Breadcrumb";
import SortDropdown from "@/components/share/SortDropdown";


import ShowcaseProductGrid from "@/components/share/ShowcaseProductGrid";
import { fetchShowcaseProducts } from "@/lib/fetchShowcaseProducts";

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
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

export default async function TrendingProductsPages() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Trending Now", href: "#" },
  ];
  const { products, totalPages } = await fetchShowcaseProducts(
    "trending-now",
    1,
    300,
  );

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 gap-2 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
        <div className="lg:col-span-8">
          {" "}
          <h3>Trending Now</h3>{" "}
        </div>
        {/* <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div> */}
        <div className="lg:col-span-12 h-full">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
            <ShowcaseProductGrid
              showcaseSlug="trending-now"
              initialProducts={products}
              initialTotalPages={totalPages}
              cols={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
