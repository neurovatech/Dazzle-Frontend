"use client";
import React from "react";
import { Package, CreditCard } from "lucide-react";
import { StackIcon } from "@/icon";

interface ProductInfoRowProps {
  inStock: boolean;
  warrantyYears?: number;
}

const ProductInfoRow: React.FC<ProductInfoRowProps> = ({
  inStock,
  warrantyYears = 1,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Stock Status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl justify-center bg-[#FCB4B4]`}
      >
        <StackIcon />
        <div>
          <p className="font-bold text-[20px] text-[#222222]">
            {inStock ? "In Stock" : "Out of Stock"}
          </p>
          <p className="text-[14px] text-[#22222299]">
            {inStock ? "Available" : "Not Available"}
          </p>
        </div>
      </div>

      {/* Warranty */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F2F2F2] justify-center">
        <CreditCard className="w-8 h-8 text-[#222222]" />
        <div>
          <p className="font-bold text-[20px] text-[#222222]">
            {warrantyYears} Year{warrantyYears > 1 ? "s" : ""}
          </p>
          <p className="text-[14px] text-[#22222299]">Warranty</p>
        </div>
      </div> 
    </div>
  );
};

export default ProductInfoRow;