"use client";
import ProductCard from "@/components/share/GlobalProductCard";
import GlobalCountdown from "@/components/share/GlobalCountdown";
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

function FlashSaleProduct({}: NewestProps) {
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
          𝗨𝗽𝘁𝗼 𝟳𝟬% 𝗢𝗙𝗙 at 𝗗𝗮𝘇𝘇𝗹𝗲 𝗠𝗮𝗿𝘁😱 𝗕𝗿𝗮𝗻𝗱 𝗡𝗲𝘄 𝗥𝗲𝗽𝗹𝗮𝗰𝗲𝗺𝗲𝗻𝘁 𝗚𝘂𝗮𝗿𝗮𝗻𝘁𝗲𝗲🔥
        </h3>{" "}
      </div>
      <div className="lg:col-span-4 ">
        {" "}
        <SortDropdown />{" "}
      </div>
      <div className="lg:col-span-12 bg-[#6d3f0e] px-4 rounded-sm">
        <GlobalCountdown title="Flash Sale" targetDate="2026-06-10T23:59:59" />
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

export default FlashSaleProduct;
