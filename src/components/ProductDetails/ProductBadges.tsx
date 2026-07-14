/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface Badge {
  label: string;
  color: "pink" | "purple" | "green" | "orange";
}

interface ProductBadgesProps {
  badges: any;
}

const colorMap: Record<Badge["color"], string> = {
  pink: "bg-[#FF7575] text-white",
  purple: "bg-[#6533F4] text-white",
  green: "bg-emerald-500 text-white",
  orange: "bg-orange-500 text-white",
};

const ProductBadges: React.FC<ProductBadgesProps> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-between ">
      {badges.map((badge:any, i:number) => (
        <span
          key={i}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export default ProductBadges;