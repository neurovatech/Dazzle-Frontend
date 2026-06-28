import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import ShowroomExplorer from "@/components/AboutUs/ShowroomExplorer";

export const metadata: Metadata = {
  title: "About Us - Dazzle",
  description: "Learn more about Dazzle, the ultimate destination for mobile phones, laptops, and gadgets in Bangladesh. Discover our showrooms, customer base, and services.",
};

import FirstImg from "@/images/about_1.png";
import FirstImg2 from "@/images/about_2.png";

const stats = [
  { value: "393,000+", label: "Unique Customers" },
  { value: "820,000+", label: "Products Delivered" },
  { value: "1.2 Million+", label: "Social Media Followers" },
  { value: "7,000+", label: "5-Star Google Reviews" },
  { value: "99.7%", label: "Customer Satisfaction" },
  { value: "9000+", label: "Successful Warranty Claims" },
  { value: "6", label: "Physical Showrooms" },
  { value: "127+", label: "Member Team" },
  {
    value: "Global Hubs",
    label: "Global Hubs in Dubai, Hong Kong & Singapore",
    highlight: true,
  },
];

export default async function AboutUs() {
  let brandsCount = 0;
  try {
    const brands = await api.get<unknown[]>("/brands", { cache: "no-store" });
    if (Array.isArray(brands)) {
      brandsCount = brands.length;
    }
  } catch (error: unknown) {
    console.error("Error loading brands count in SSR about page:", error);
  }

  return (
    <main className="bg-white dark:bg-[#2E2B28] min-h-screen flex flex-col flex-1 max-w-355 mx-auto">
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
        {/* Welcome Label */}
        <p className="text-[#c9a230] dark:text-white font-semibold text-[13px] mt-5 mb-1 tracking-wide">
          Welcome to Dazzle
        </p>

        {/* Heading */}
        <h1 className="text-[26px] sm:text-[32px] font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          Our Perfect Store
        </h1>

        {/* Description */}
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.8] mb-8 max-w-full">
          Order the all-new iPhone 17 Series now at the best price in
          Bangladesh! Experience unmatched performance and innovation, designed
          to elevate every moment of your life. Get your device from the. Order
          the all-new iPhone 17 Series now at the best price in Bangladesh!
          Experience unmatched performance and innovation, designed to elevate
          every moment of your life. Get your device from the. Order the all-new
          iPhone 17 Series now at the best price in Bangladesh! Experience
          unmatched performance and innovation, designed to elevate every moment
          of your life. Get your device from the. Order the all-new iPhone 17
          Series now at the best price in Bangladesh! Experience unmatched
          performance and innovation, designed to elevate every moment of your
          life. Order the all-new iPhone 17 Series now at the best price in
          Bangladesh! Experience unmatched performance and innovation, designed
          to elevate every moment of your life. Get your device from the.
        </p>

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
        <div className="w-full rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden divide-x divide-y divide-gray-200">
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
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex  mb-6 gap-4 ">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center justify-center text-center px-2 py-5 bg-[#E9CCAE47] rounded-2xl`}
            >
              <span
                className={`font-bold leading-tight ${
                  stat.highlight
                    ? "text-[13px] text-gray-800 dark:text-white"
                    : "text-[15px] text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 leading-snug max-w-20">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Two Customer Photos ── */}

        {/* Heading */}
        <h2 className="text-[26px] sm:text-[32px] font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          Our Customer-Centric Approach
        </h2>

        {/* Description */}
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.8] mb-8 max-w-full">
          Order the all-new iPhone 17 Series now at the best price in
          Bangladesh! Experience unmatched performance and innovation, designed
          to elevate every moment of your life. Get your device from the. Order
          the all-new iPhone 17 Series now at the best price in Bangladesh!
          Experience unmatched performance and innovation, designed to elevate
          every moment of your life. Get your device from the. Order the all-new
          iPhone 17 Series now at the best price in Bangladesh! Experience
          unmatched performance and innovation, designed to elevate every moment
          of your life. Get your device from the. Order the all-new iPhone 17
          Series now at the best price in Bangladesh! Experience unmatched
          performance and innovation, designed to elevate every moment of your
          life. Order the all-new iPhone 17 Series now at the best price in
          Bangladesh! Experience unmatched performance and innovation, designed
          to elevate every moment of your life. Get your device from the.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
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
              src={FirstImg2}
              alt="Dazzle Happy Customer"
              fill
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden divide-x divide-y divide-gray-200">
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

        <div className="hidden lg:flex  mb-6 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center justify-center text-center px-2 py-5 bg-[#E9CCAE47] rounded-2xl`}
            >
              <span
                className={`font-bold leading-tight ${
                  stat.highlight
                    ? "text-[13px] text-gray-800 dark:text-white"
                    : "text-[15px] text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 leading-snug max-w-20">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── SSR (Server Component) and Client Component Example Showcase ── */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-10">
          <h2 className="text-[22px] font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
            Hybrid Architecture in Action
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            নিচে আমাদের প্রজেক্টের **Server-Side Rendering (SSR)** এবং **Client-Side Rendering (CSR)** এর সমন্বিত কাজের একটি বাস্তব উদাহরণ দেওয়া হলো:
          </p>

          {/* 1. SSR Component Data (Server-rendered) */}
          <div className="p-6 bg-[#E9CCAE22] dark:bg-[#E9CCAE11] rounded-2xl border border-gray-150 dark:border-gray-800">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-1">
              🌐 Live Brands Count (Direct Server SSR)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              এই কাউন্টারটি সরাসরি সার্ভার সাইডে API `https://apix.bigpoint.com.bd/brands` কল করে রেন্ডার করা হয়েছে। ব্রাউজারের Network ট্যাবে এর কোনো অস্তিত্ব থাকবে না।
            </p>
            <span className="inline-flex items-center justify-center px-4 py-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-xl text-xs font-extrabold border border-yellow-500/20">
              আমাদের ব্র্যান্ড সংখ্যা: {brandsCount > 0 ? `${brandsCount} টি ব্র্যান্ড` : "কানেক্ট করতে পারেনি (Fallback)"}
            </span>
          </div>

          {/* 2. CSR Component (Client-Side State Interaction) */}
          <ShowroomExplorer />
        </div>

      </div>
    </main>
  );
}
