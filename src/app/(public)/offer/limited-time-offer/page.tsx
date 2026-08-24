import Breadcrumb from "@/components/share/Breadcrumb";
import GlobalCountdown from "@/components/share/GlobalCountdown";
import ProductCard from "@/components/share/GlobalProductCard";
import { api } from "@/lib/api";

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

export default async function LimitedTimeOffer() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Offer Products", href: "#" },
  ];
  let products: ProductCardItem[] = [];
   
    try {
      const res = await api.get<ShowcaseItemsResponse>(
         "/showcase-items?showcaseSlug=hot-deal",
        { next: { revalidate: 60 } }
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
        isBestDeal: false,
        inStock: !item.isTba,
        image: item.thumbnails?.mediaFileUrl ?? "/images/product.png",
      }));
    } catch (error) {
      console.error("Error fetching feature products SSR:", error);
    }

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
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />

        <div className="lg:col-span-12  bg-[#6d3f0e] px-4 rounded-sm">
        <GlobalCountdown title="Flash Sale" targetDate={getNext15thDate()} />
      </div>
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 gap-2 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
      <div className="lg:col-span-8">
        {" "}
        <h3>
          Offer Products
        </h3>{" "}
      </div>
      {/* <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div> */}
      <div className="lg:col-span-12 h-full">
        <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
          {products.map((product) => (
            <div key={product.uuid}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
