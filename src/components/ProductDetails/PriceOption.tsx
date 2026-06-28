"use client";
import React from "react";

interface PriceOptionProps {
  label: string;
  price: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}

const PriceOption: React.FC<PriceOptionProps> = ({
  label,
  price,
  subtitle,
  selected,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl border bg-[#FAFAFA] text-left transition-all duration-150
        ${selected ? "border-[#B57908]" : "border-gray-200 hover:border-gray-300"}
      `}
    >
      {/* Radio Circle */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${selected ? "border-[#B57908]" : "border-gray-300"}
        `}
      >
        {selected && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#B57908]" />
        )}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-bold text-gray-800">
          {label}{" "}
          <span className="text-[#B57908]">{price}</span>
        </p>
        <p className="text-xs text-[#222222B2] mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
};

export default PriceOption;