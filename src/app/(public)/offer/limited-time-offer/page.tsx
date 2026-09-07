import Breadcrumb from "@/components/share/Breadcrumb";
import GlobalCountdown from "@/components/share/GlobalCountdown";


import ShowcaseProductGrid from "@/components/share/ShowcaseProductGrid";
import { fetchShowcaseProducts } from "@/lib/fetchShowcaseProducts";

export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
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

  const { products, totalPages } = await fetchShowcaseProducts(
    "hot-deal",
    1,
    300,
  );
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
          <h3>Offer Products</h3>{" "}
        </div>
        {/* <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div> */}
        <div className="lg:col-span-12 h-full">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
            <ShowcaseProductGrid
              showcaseSlug="hot-deal"
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
