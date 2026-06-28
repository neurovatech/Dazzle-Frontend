import Link from "next/link";
import ProductCard from "@/components/share/GlobalProductCard";
import Banner from "@/images/o_banner.png";
import Deals from "@/images/deals.png";
import Image from "next/image";

function FeatureProducts() {
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

  const features = [
    {
      label: "100% Genuine\nProducts",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Super fast\nDelivery",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.5 2a2.5 2.5 0 0 1 5 0c4 1.5 6 5 6 9a10 10 0 1 1-20 0c0-4 2-7.5 6-9a2.5 2.5 0 0 1 3 0z" />
          <line x1="12" y1="7" x2="10" y2="13" />
          <line x1="10" y1="13" x2="14" y2="13" />
          <line x1="14" y1="13" x2="12" y2="19" />
        </svg>
      ),
    },
    {
      label: "36 Months\nInstallments",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
      ),
    },
    {
      label: "2 Years\nReplacement",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="8" height="8" rx="1" />
          <rect x="14" y="13" width="8" height="8" rx="1" />
          <path d="M10 7h4l-4 4" />
          <path d="M14 17H10l4-4" />
        </svg>
      ),
    },
    {
      label: "2 Years\nWarranty",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-3-7 3V3a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      label: "2 Years\nExchange",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7a6251"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
  ];

  return (
    <div className=" px-4">
      <div className="flex justify-between items-center">
        <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Feature Products
        </h3>
        <Link
          href="#"
          className="text-sm font-medium text-primary hover:underline dark:text-white"
        >
          See all
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-5 grid-cols-2 mt-5">
        {products.map((product, i) => (
          <div key={i}>
            <ProductCard key={i} {...product} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 mt-6 items-stretch cursor-pointer">
        <div className="lg:col-span-8 h-full">
          <Image
            src={Banner}
            width={500}
            height={500}
            alt="Offer banner"
            loading="lazy"
            className="w-full h-full object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </div>

        <div className="lg:col-span-4 h-full">
          <Image
            src={Deals}
            width={500}
            height={500}
            alt="Offer banner"
            loading="lazy"
            className="w-full h-full object-cover rounded-xl transition-all duration-500 hover:shadow-lg"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6 grid-cols-2  justify-center mt-10 ">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#35291e] rounded-2xl w-full py-7 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: "0px 6px 45px 25px #E9CCAE24" }}
          >
            <div className="w-14 h-14 rounded-full bg-[#f5ede4] flex items-center justify-center">
              {feature.icon}
            </div>
            <p className="text-center text-[#4a3f35] dark:text-white text-xs font-medium leading-snug px-2 whitespace-pre-line">
              {feature.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureProducts;
