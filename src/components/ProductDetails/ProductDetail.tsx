"use client";
import React, { useState } from "react";
import ProductBadges from "./ProductBadges";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductVariants from "./ProductVariants";
import ProductColorVariants from "./ProductColorVariants";
import DazzleCare from "./DazzleCare";
import ContactOptions from "./ContactOptions";
import IPHONE_ORANGE from "@/images/oreng_i.png";

import CheckAvailability from "./CheckAvailability";
import ProductAddOn from "./AddOn";
import ProductCard from "./ProductCrad";
import ProductSpecifications from "./ProductSpecifications";
import GlobalTabs from "@/components/share/GlobalTabs";
import MostPopular from "@/components/HomePage/MostPopular/MostPopular";
import Breadcrumb from "@/components/share/Breadcrumb";
import MarqueeBulletinBar from "@/components/HomePage/MarqueeBulletinBar";
import StickyPurchaseBar from "./StickyPurchaseBar";


const IPHONE_WHITE =
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F75552%2FiPhone-17-Pro-Max-Pro-Price-in-Bangladesh-(2).jpg&w=1080&q=75";

const IPHONE_BLACK =
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F75551%2FiPhone-17-Pro-Max-Pro-Price-in-Bangladesh-(1).jpg&w=1080&q=75";

const IMAGES = [IPHONE_ORANGE.src, IPHONE_WHITE, IPHONE_BLACK];
const COLOR_OPTIONS = [
  { label: "", value: "desert", image: IPHONE_ORANGE.src },
  { label: "", value: "natural", image: IPHONE_WHITE },
  { label: "", value: "black", image: IPHONE_BLACK },
];

const products = [
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
  {
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F48522%2FiPhone-14-Price-in-Bangladesh-Yellow.jpg&w=640&q=75",
    name: "Belkin USB C 7 in 1 Multiport...",
    inStock: true,
    price: "৳1,00,000",
    originalPrice: "৳1,30,000",
  },
];

const ProductDetail: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(0);

  const handleVariantChange = (selected: Record<string, string>) => {
    const colorValue = selected["Color"];
    const index = COLOR_OPTIONS.findIndex((opt) => opt.value === colorValue);
    if (index !== -1) setSelectedColor(index);
  };
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Apple airpods pro (2nd gen)", href: "/categories/apple airpods pro (2nd gen)" },
  ];

  const tabsData = [
    {
      label: "Newest",
      content: <ProductSpecifications groups={[]} />,
    },
    {
      label: "Popular",
      content: <ProductSpecifications groups={[]} />,
    },
    {
      label: "Olds",
      content: <ProductSpecifications groups={[]} />,
    },
  ];

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-350 mx-auto lg:px-4 px-2">
        <MarqueeBulletinBar />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <StickyPurchaseBar />

      <div className="max-w-350 mx-auto lg:px-4 px-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className=" rounded-2xl shadow-sm p-5 sticky top-6 transition-colors duration-200">
            <ProductImageGallery
              images={IMAGES}
              selected={selectedColor}
              onSelect={setSelectedColor}
              badges={
                <ProductBadges
                  badges={[
                    { label: "10%", color: "pink" },
                    { label: "Buy 2 Get 1", color: "purple" },
                  ]}
                />
              }
            />

            <div className=" grid-cols-2 lg:grid-cols-3 gap-2 mt-5 hidden lg:grid">
              {products.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>

            <div className=" hidden lg:block space-y-6 pt-2">
              <ContactOptions />
            </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ProductInfo
              title="Belkin USB C 7 in 1 Multiport Adaptor"
              brand="Apple"
              code="5598678"
              inStock={true}
              stockNote="Please Hurry! Only 21 left in stock"
              warrantyNote="1 Year Official Warranty Support Except USA Variant"
              stats={{ soldLastHours: 1, reviewCount: 217, viewingNow: 12 }}
              price={100000}
              originalPrice={130000}
              emiFrom={3000}
            />

            <div className="border border-[#e7e7e7] dark:border-[#4a3f36] bg-[#f7f7f7] dark:bg-[#3e3329] text-black dark:text-white rounded-2xl p-4 mt-4">
              <ProductColorVariants
                groups={[
                  {
                    label: "Color",
                    type: "color",
                    options: COLOR_OPTIONS,
                  },
                ]}
                onChange={handleVariantChange}
              />
              <ProductVariants
                groups={[
                  {
                    label: "Region",
                    type: "text",
                    options: [
                      { label: "JP/MEA Dual e sim", value: "jp-mea" },
                      { label: "Global (Sim + e Sim)", value: "global" },
                      { label: "HK/CH Duel Sim", value: "hk-ch" },
                      { label: "#Samsung", value: "samsung" },
                    ],
                  },
                  {
                    label: "Storage",
                    type: "text",
                    options: [
                      { label: "256GB", value: "256" },
                      { label: "512GB", value: "512" },
                      { label: "1TB", value: "1tb" },
                      { label: "2TB", value: "2tb" },
                    ],
                  },
                ]}
              />
            </div>

            <div className="pt-5">
              <DazzleCare
                options={[
                  {
                    id: "ultimate",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description:
                      "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "bundle",
                    title: "DC+ & DSC+ Bundle",
                    description:
                      "1-year device replacement + 2-year display coverage",
                    icon: "📦",
                    price: 100000,
                    originalPrice: 200000,
                  },
                  {
                    id: "ultimate1",
                    title: "Dazzle Ultimate Care+ (1 Year)",
                    description:
                      "Hardware replacement & accidental damage coverage",
                    icon: "🛡️",
                    price: 100000,
                    originalPrice: 200000,
                  },
                ]}
              />
            </div>

            <div className="">
              <CheckAvailability />
            </div>

            <div className="">
              <ProductAddOn />
            </div>

            <div className="lg:col-span-5">
              <div className=" grid-cols-2 lg:grid-cols-3 gap-2 mt-5 grid lg:hidden">
                {products.map((product, index) => (
                  <ProductCard key={index} {...product} />
                ))}
              </div>

              <div className=" grid lg:hidden space-y-6 pt-2">
                <ContactOptions />
              </div>
            </div>
          </div>

          <div className="lg:col-span-12">
            <GlobalTabs tabs={tabsData} />
          </div>
          <div className="lg:col-span-12">
              <MostPopular />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
