/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { CheckHome } from "@/icon";
import GlobalModal from "@/components/share/GlobalModal";
import { MapPin, Navigation, Info } from "lucide-react";

export default function PriceAvailability({ product }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<"offer" | "regular">("offer");

  return (
    <div className="lg:flex gap-3 my-6">
      {/* Offer Price */}
      <button
        onClick={() => setSelectedPrice("offer")}
        className={`flex-1 w-full mb-4 lg:mb-0 flex items-center gap-3 bg-white border rounded-xl shadow-sm px-4 py-3 text-left transition-colors cursor-pointer
          ${selectedPrice === "offer" ? "border-orange-400" : "border-gray-200 dark:border-[#4a3f36]"}
        `}
      >
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
            ${selectedPrice === "offer" ? "border-orange-400" : "border-gray-300"}
          `}
        >
          {selectedPrice === "offer" && (
            <span className="w-2 h-2 rounded-full bg-orange-400" />
          )}
        </span>

        <div className="flex flex-col items-start text-black">
          <span className="font-semibold text-sm">
            Offer Price:{" "}
            <span className="text-[#CB843B]">
              {product?.discountedPrice?.toLocaleString()} ৳
            </span>
          </span>
          <span className="text-[#767676] text-xs">Cash/Card/MFS Payment</span>
        </div>
      </button>

      {/* Regular Price */}
      <button
        onClick={() => setSelectedPrice("regular")}
        className={`flex-1 w-full mb-4 lg:mb-0 flex items-center gap-3 bg-white border rounded-xl shadow-sm px-4 py-3 text-left transition-colors cursor-pointer
          ${selectedPrice === "regular" ? "border-orange-400" : "border-gray-200 dark:border-[#4a3f36]"}
        `}
      >
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
            ${selectedPrice === "regular" ? "border-orange-400" : "border-gray-300"}
          `}
        >
          {selectedPrice === "regular" && (
            <span className="w-2 h-2 rounded-full bg-orange-400" />
          )}
        </span>

        <div className="flex flex-col items-start text-black ">
          <span className="font-semibold  text-sm">
            Regular Price:{" "}
            <span className="text-[#CB843B]">
              {product?.regularPrice?.toLocaleString()} ৳
            </span>
          </span>
          <span className="text-[#767676] text-xs bg-gray-100 px-0.5">
  EMI begin at BDT {Math.round((product?.regularPrice ?? 0) / 12).toLocaleString()} per month
</span>
        </div>
      </button>
    </div>
  );
}