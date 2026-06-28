"use client";

import { useState } from "react";
import Link from "next/link";
import GlobalModal from "@/components/share/GlobalModal";
import ProductImageGallery from "./ProductImageGallery";
import ProductBadges from "./ProductBadges";
import QuickViewProductInfo from "./QuickViewProductInfo";

import IPHONE_ORANGE from "@/images/oreng_i.png";
import ProductColorVariants from "./ProductColorVariants";
import ProductVariants from "./ProductVariants";

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

function ProductQuicView() {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const handleVariantChange = (selected: Record<string, string>) => {
    const colorValue = selected["Color"];
    const index = COLOR_OPTIONS.findIndex((opt) => opt.value === colorValue);
    if (index !== -1) setSelectedColor(index);
  };

  return (
    <div>
      <GlobalModal isOpen={open} onClose={() => setOpen(false)}>
        <div className="p-5 overflow-y-auto scrollbar-hide md:max-h-138 max-h-132">
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

          <div className="pt-6">
            <QuickViewProductInfo
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
          </div>

          <div className="pt-6">
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
        </div>

        <div className="rounded-b-2xl gap-4 bg-white p-4 shadow-[0px_-4px_26.6px_6px_#0000002B] flex items-center justify-between">
          <Link
            href="#"
            className="border border-[#E7E7E7] bg-[#F7F7F7] text-[#222222] px-4 py-2 rounded-md hover:bg-[#222222] hover:text-white transition-colors duration-500 w-full justify-center flex items-center"
          >
            ADD TO CART
          </Link>
          <Link
            href="#"
            className="border border-[#E7E7E7] bg-[#222222] text-white px-4 py-2 rounded-md hover:bg-[#F7F7F7] hover:text-[#222222] transition-colors duration-500 w-full justify-center flex items-center"
          >
            BUY NOW
          </Link>
        </div>
      </GlobalModal>

      <button
        onClick={() => setOpen(true)}
        className="lg:w-12 lg:h-12 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
}

export default ProductQuicView;
