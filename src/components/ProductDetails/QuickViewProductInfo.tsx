import React from "react";
import Link from "next/link";
import { Heart, Share2, Flame } from "lucide-react";
import { WarrantyIcon, StarIcon, EyeIcon, SwapIcon } from "@/icon";
import QuantitySelector from "./QuantitySelector";

interface ProductInfoProps {
  title: string;
  brand: string;
  code: string;
  inStock: boolean;
  stockNote?: string;
  warrantyNote?: string;
  stats: {
    soldLastHours: number;
    reviewCount: number;
    viewingNow: number;
  };
  price: number;
  originalPrice: number;
  emiFrom?: number;
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

const QuickViewProductInfo: React.FC<ProductInfoProps> = ({
  title,
  brand,
  code,
  inStock,
  stockNote,
  warrantyNote,
  stats,
  price,
  originalPrice,
  emiFrom,
}) => {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div className="space-y-3">
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-3">
        {/* <h1 className="text-xl sm:text-2xl font-bold text-[#222222] leading-snug">
          {title}
        </h1> */}

        <div className="flex flex-wrap items-center gap-2 text-sm pr-2 ">
          <span className="text-gray-500">Availability:</span>
          <span
            className={`font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className="">
          <span className="text-[#222222]">
            Code: <span className="font-semibold text-[#222222]">#{code}</span>
          </span>
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-[#222222] leading-snug">
        {title}
      </h1>

      {/* Brand + Code */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex gap-2 items-center  pr-2">
          <span className="text-[24px] font-extrabold text-[#B57908]">
            {formatPrice(price)}
          </span>
          <span className="text-[16px] text-[#747474] line-through">
            {formatPrice(originalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-[#222222]">
            Quantity :
          </span>
          <QuantitySelector defaultValue={1} />
        </div>
      </div>

      {/* Stock + Warranty */}
      <div className="space-y-1.5">
        {/* <div className="flex flex-wrap items-center gap-2 text-sm">
          {stockNote && (
            <span className="flex items-center gap-1 text-[#222222] font-medium">
              <Flame className="text-orange-500" size={13} /> {stockNote}
            </span>
          )}
        </div> */}
        {warrantyNote && (
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <span className="text-base">
              {" "}
              <WarrantyIcon />{" "}
            </span>
            <span className="bg-linear-to-r from-[#6D3F0E] to-[#D3791B] bg-clip-text text-transparent">
              {warrantyNote}
            </span>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default QuickViewProductInfo;
