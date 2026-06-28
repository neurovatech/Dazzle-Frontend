"use client";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";

import C1 from "@/images/c_1.png";
import C2 from "@/images/c_2.png";
import C3 from "@/images/c_3.png";
import C4 from "@/images/c_4.png";
import ProductCard from "@/components/share/GlobalProductCard";
interface CategoryItem {
  id: number;
  title: string;
  image: StaticImageData;
  link: string;
}

function ShopBrand() {

  const categoriesData: CategoryItem[] = [
    {
      id: 1,
      title: "Mobile",
      image: C1,
      link: "/categories/mobile",
    },
    {
      id: 2,
      title: "Tablets",
      image: C2,
      link: "/categories/tablets",
    },
    {
      id: 3,
      title: "Laptops",
      image: C3,
      link: "/categories/laptops",
    },
    {
      id: 4,
      title: "Smart-watch",
      image: C4,
      link: "/categories/smart-watch",
    },
    {
      id: 5,
      title: "Mobile",
      image: C1,
      link: "/categories/mobile",
    },
    {
      id: 6,
      title: "Tablets",
      image: C2,
      link: "/categories/tablets",
    },
    {
      id: 7,
      title: "Laptops",
      image: C3,
      link: "/categories/laptops",
    },
    {
      id: 8,
      title: "Smart-watch",
      image: C4,
      link: "/categories/smart-watch",
    },
  ];

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
  ];


  return (
    <div className="md:px-12.5 px-4">
      <div className="flex justify-between items-center ">
        <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          {" "}
          Shop by Brand{" "}
        </h3>
        <Link href="#" className="">
          See all
        </Link>
      </div>
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-8 grid-cols-4">
          {categoriesData?.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="flex flex-col justify-center items-center group cursor-pointer"
            >
              <div className="bg-[#F5F5F5] dark:bg-[#CB843B]/10 dark:group-hover:bg-white/10 p-5 rounded-4xl transition-all duration-300 group-hover:bg-[#CB843B]/10 group-hover:scale-105">
                <Image
                  src={item.image}
                  width={100}
                  height={100}
                  alt={item.title}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <h5 className="lg:text-sm text-[10px] font-medium text-primary pt-2 transition-colors duration-300 group-hover:text-[#CB843B]">
                {item.title}
              </h5>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:gap-4 gap-2 md:grid-cols-5 grid-cols-2 mt-5">
        {products.map((product, i) => (
          <div key={i}>
            <ProductCard key={i} {...product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopBrand;
