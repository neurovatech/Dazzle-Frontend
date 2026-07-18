"use client";
import React from "react";

interface VariantOption {
  label: string;
  value: string;
  image?: string;
  disabled?: boolean;
}

interface VariantGroup {
  label: string;
  type: "color" | "text";
  options: VariantOption[];
}

interface ProductVariantsProps {
  groups: VariantGroup[];
  // Parent থেকে controlled — কোন option selected সেটা parent জানে
  selectedValues?: Record<string, string>;
  onSelect?: (group: string, value: string) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  groups,
  selectedValues = {},
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div
          key={group.label}
          className="space-y-2 flex gap-3 my-3 lg:px-5 pt-[10px] dark:border-[#4a3f36]"
        >
          <p className="text-sm font-semibold text-[#222222] pt-2.5 dark:text-white">
            {group.label}:
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const isActive = selectedValues[group.label] === opt.value;
              const isDisabled = opt.disabled === true;
              return (
                <button
                  key={opt.value}
                  onClick={() => !isDisabled && onSelect?.(group.label, opt.value)}
                  disabled={isDisabled}
                  className={`flex items-center gap-1.5 transition-all duration-150 rounded-xl border-2 font-medium text-sm
                    ${
                      isActive
                        ? "border-[#E9CCAE] bg-[#E9CCAE] dark:text-black shadow-sm"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                          : "border-[#EEEEEE] bg-white text-gray-600 hover:shadow-sm"
                    }
                    ${group.type === "color" ? "p-1.5 pr-2.5" : "px-3 py-1.5"}
                  `}
                >
                  {group.type === "color" && opt.image && (
                    <img
                      src={opt.image}
                      alt={opt.label}
                      className="w-7 h-7 rounded-lg object-contain bg-white border border-gray-100"
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariants;