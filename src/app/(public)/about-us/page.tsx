import type { Metadata } from "next";
import Link from "next/link";
import AboutPagesCom from "./AboutPagesCom"
export const metadata: Metadata = {
  title: "About Us - Dazzle",
  description: "Learn more about Dazzle, the ultimate destination for mobile phones, laptops, and gadgets in Bangladesh. Discover our showrooms, customer base, and services.",
};

export default function AboutUs() {
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

      <AboutPagesCom />


    </main>
  );
}
