import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import ShowroomExplorer from "@/components/AboutUs/ShowroomExplorer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Dazzle, the ultimate destination for mobile phones, laptops, and gadgets in Bangladesh. Discover our showrooms, customer base, and services.",
};

import FirstImg from "@/images/about_1.png";
import FirstImg2 from "@/images/about_2.png";
import FirstImg3 from "@/images/card-02.jpeg";
import FirstImg4 from "@/images/card-03.jpeg";

const stats = [
  {
    value: "393,000+",
    label: "Unique Customers",
    details:
      "A growing family of satisfied clients who trust Dazzle for all their tech needs.",
  },
  {
    value: "820,000+",
    label: "Products Delivered",
    details:
      "From smartphones to laptops, smartwatches to accessories, we’ve made dreams come true across the nation.",
  },
  {
    value: "1.2 Million+",
    label: "Social Media Followers",
    details: "A community built on trust and love for our brand.",
  },

  {
    value: "7,000+",
    label: "5-Star Google Reviews",
    details:
      "A testimony to our commitment to excellence and customer satisfaction.",
  },
  {
    value: "99.7%",
    label: "Customer Satisfaction",
    details: "Our highest priority is making you smile.",
  },
  {
    value: "9000+",
    label: "Successful Warranty Claims",
    details: "Hassle-free after-sales service to ensure peace of mind",
  },
  {
    value: "6",
    label: "Physical Showrooms",
    details:
      "Convenient locations across Dhaka and Chittagong for a seamless shopping experience.",
  },
  {
    value: "127+",
    label: "Member Team",
    details: "Experts who ensure you get the best service, online and offline.",
  },
  {
    value: "Global Hubs",
    // label: "Global Hubs in Dubai, Hong Kong & Singapore",
    label:
      "Global Hubs in Dubai, Hong Kong & Singapore: Bringing world-class products and services right to your doorstep.",
    highlight: true,
  },
];
const stats2 = [
  {
    value: "",
    label: "Countrywide Free Delivery",
    details:
      "No matter where you are in Bangladesh, your order reaches you without any delivery charges",
  },
  {
    value: "",
    label: "36-Month EMI Facility",
    details: "Flexible payment options for products over BDT 5,000 through 39 partner banks",
  },
  {
    value: "",
    label: "Exclusive Exchange Offers",
    details: "Upgrade your gadgets with the best value for your old devices",
  },

  {
    value: "",
    label: "Competitive Pricing",
    details: "Unbeatable prices for a wide range of electronics, accessories, and more",
  },
  {
    value: "",
    label: "Authentic Products",
    details: "100% original gadgets and accessories from globally renowned brands",
  },
  {
    value: "",
    label: "Comprehensive Warranty Services",
    details: "Extended warranties for added peace of mind",
  },
  {
    value: "",
    label: "Pre-Orders for Any Electronics",
    details: "Get the latest devices delivered within 15 days",
  },
  {
    value: "",
    label: "After-Sales Service",
    details: "From expert assistance to smooth warranty claims, we’re here for you",
  },
  {
    value: "",
    label: "24/7 Customer Support",
    details: "Round-the-clock service to ensure you never face any inconvenience",
  },
  {
    value: "",
    label: "Fast Delivery",
    details: "Quick and reliable delivery services tailored to your needs",
  },
];

export default async function AboutUs() {
  let brandsCount = 0;
  try {
    const brands = await api.get<unknown[]>("/brands", { next: { revalidate: 60 } });
    if (Array.isArray(brands)) {
      brandsCount = brands.length;
    }
  } catch (error: unknown) {
    console.error("Error loading brands count in SSR about page:", error);
  }

  // Plain <div>, not <main>: the root layout now provides the single <main>
  // landmark for every page, and nesting a second one is invalid HTML.
  return (
    <div className="bg-white dark:bg-[#2E2B28] min-h-screen flex flex-col flex-1 max-w-355 mx-auto">
      {/* Breadcrumb */}
      <div className=" px-4 sm:px-6 pt-5 pb-0">
        <nav className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-0.5">/</span>
          <span className="text-gray-500 dark:text-gray-400">About Us</span>
        </nav>
      </div>

      {/* Content Wrapper */}
      <div className=" px-4 sm:px-6 pb-14">
        <div className="w-full flex flex-col justify-center items-center">
          {/* Welcome Label */}
          <p className="text-[#c9a230] dark:text-white font-semibold text-[13px] mt-5 mb-1 tracking-wide">
            Welcome to Dazzle
          </p>

          {/* Heading */}
          <h1 className="text-[26px] sm:text-[32px] font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Our Perfect Store
          </h1>

          {/* Description */}
          <p className="text-[13px] text-gray-500 dark:text-white leading-[1.8] mb-8 max-w-full md:w-[50%] w-full flex flex-col items-center text-center">
            <span className="pb-3">
              Dazzle is a name synonymous with excellence, innovation, and trust
              in the world of technology and gadgets. Over the past 9 years, we
              have proudly built a legacy rooted in exceptional customer
              satisfaction and unmatched quality.
            </span>
            With a growing family of 393,000+ unique customers, we have earned
            the trust of tech enthusiasts across the nation. From smartphones to
            laptops, smartwatches to accessories, we have successfully delivered
            over 820,000+ products, turning dreams into reality.
          </p>
        </div>

        {/* ── Store Front Image ── */}
        <div className="w-full rounded-xl overflow-hidden mb-5 shadow-sm">
          <div className="relative w-full" style={{ paddingBottom: "52%" }}>
            <Image
              src={FirstImg}
              alt="Dazzle Store Front"
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-[54px] mb-[20px]">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-center border p-6 border-[#2222] rounded-md ${
                  stat.highlight
                    ? "bg-gray-50 col-span-2 sm:col-span-1"
                    : "bg-white"
                }`}
              >
                <span className="text-2xl font-semibold text-[#CB843B] leading-tight">
                  {stat.value}
                </span>
                <span className="mt-[14px] md:mt-[15px] mb-[6px] text-[14px] text-black md:text-[16px] font-semibold">
                  {stat.label}
                </span>
                <p className="text-center text-muted text-[8px] md:text-[12px] text-black/60 md:mx-7 font-medium leading-[21.6px]">
                  {stat.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two Customer Photos ── */}

        {/* Heading */}
        <div className="w-full flex flex-col justify-center items-center">
          {/* Welcome Label */}
          <p className="text-[#c9a230] dark:text-white font-semibold text-[13px] mt-5 mb-1 tracking-wide">
            WHY CHOOSE US
          </p>

          {/* Heading */}
          <h1 className="text-[26px] sm:text-[32px] font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            OVER 9 YEARS OF EXPERIENCE
          </h1>

          {/* Description */}
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.8] mb-8 max-w-full">
            Over 9 years of experience, we have crafted thousands of strategic discovery process that ? enables us to peel back the layers which enable us to understand, connect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div
            className="relative w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm"
            style={{ paddingBottom: "110%" }}
          >
            <Image
              src={FirstImg2}
              alt="Dazzle Happy Customer"
              fill
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover object-top"
            />
          </div>
          <div
            className="relative w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm"
            style={{ paddingBottom: "110%" }}
          >
            <Image
              src={FirstImg3}
              alt="Dazzle Happy Customer"
              fill
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover object-top"
            />
          </div>
          <div
            className="relative w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm"
            style={{ paddingBottom: "110%" }}
          >
            <Image
              src={FirstImg4}
              alt="Dazzle Happy Customer"
              fill
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden divide-x divide-y divide-gray-200">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-center px-3 py-4 ${
                  stat.highlight
                    ? "bg-gray-50 col-span-2 sm:col-span-1"
                    : "bg-white"
                }`}
              >
                <span className="font-bold text-[15px] text-gray-900 dark:text-white leading-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-300 mt-1 leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-[54px] mb-[20px]">
            {stats2.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col bg-white items-center justify-center text-center border p-6 border-[#2222] rounded-md  "bg-gray-50 col-span-2 sm:col-span-1 }`}
              >
                <span className="mt-[14px] md:mt-[15px] mb-[6px] text-[14px] text-black md:text-[16px] font-semibold">
                  {stat.label}
                </span>
                <p className="text-center text-muted text-[8px] md:text-[12px] text-black/60 md:mx-7 font-medium leading-[21.6px]">
                  {stat.details}
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
