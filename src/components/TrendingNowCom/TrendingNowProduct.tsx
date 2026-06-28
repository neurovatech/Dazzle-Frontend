"use client";
import ProductCard from "@/components/share/GlobalProductCard";
import SortDropdown from "@/components/share/SortDropdown";
export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
}

interface NewestProps {
  slides?: SlideItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

function TrendingNowProduct({}: NewestProps) {
  const products = [
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Sony WH-1000XM5 Noise Cancelling Headphones",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      badge: "Limited",
      isBestDeal: true,
      inStock: false,
      image: "/images/product.png",
    },
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Sony WH-1000XM5 Noise Cancelling Headphones",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      badge: "Limited",
      isBestDeal: true,
      inStock: false,
      image: "/images/product.png",
    },
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: 100000,
      originalPrice: 130000,
      discount: 10,
      badge: "Buy 2 Get 1",
      isBestDeal: true,
      inStock: true,
      image: "/images/product.png",
    },
    {
      title: "Samsung Galaxy Buds Pro Wireless Earbuds",
      price: 75000,
      originalPrice: 95000,
      discount: 21,
      badge: "Hot Sale",
      isBestDeal: false,
      inStock: true,
      image: "/images/product.png",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 gap-2 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
      <div className="lg:col-span-8">
        {" "}
        <h3>
          Trending Now
        </h3>{" "}
      </div>
      <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div>
      <div className="lg:col-span-12 h-full">
        <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
          {products.map((product, i) => (
            <div key={i}>
              <ProductCard key={i} {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrendingNowProduct;

