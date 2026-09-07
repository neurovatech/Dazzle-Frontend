import Breadcrumb from "@/components/share/Breadcrumb";
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

export default async function FeatureProductsPages() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Most Popular", href: "#" },
  ];
  //  const products = await showcaseProducts("most-popular");
   const { products, totalPages } = await fetchShowcaseProducts("most-popular", 1, 300);

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 gap-2 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
      <div className="lg:col-span-8">
        {" "}
        <h3>
          Most Popular
        </h3>{" "}
      </div>
      {/* <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div> */}
      <div className="lg:col-span-12 h-full">
        <ShowcaseProductGrid
          showcaseSlug="most-popular"
          initialProducts={products}
          initialTotalPages={totalPages}
          cols={5}
        />
      </div>
    </div>
    </div>
  );
}
