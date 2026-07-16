"use client";
import React from "react";
import Image from "next/image";

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

interface ProductColorVariantsProps {
  groups: VariantGroup[];
  // Parent-controlled selected values
  selectedValues?: Record<string, string>;
  onChange?: (selected: Record<string, string>) => void;
}

const ProductColorVariants: React.FC<ProductColorVariantsProps> = ({
  groups,
  selectedValues = {},
  onChange,
}) => {
  const handleSelect = (label: string, value: string) => {
    const next = { ...selectedValues, [label]: value };
    onChange?.(next);
  };

  return (
    <div>
      {groups.map((group) => (
        <div
          key={group.label}
          className="flex gap-3 lg:px-5 border-b border-[#e7e7e7] dark:border-[#4a3f36] pb-5"
        >
          <p className="text-sm font-semibold text-[#222222] dark:text-white pt-2.5 shrink-0">
            {group.label} :
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {group.options.map((opt) => {
              const isActive = selectedValues[group.label] === opt.value;
              const isDisabled = opt.disabled === true;
              return (
                <button
                  key={opt.value}
                  onClick={() => !isDisabled && handleSelect(group.label, opt.value)}
                  disabled={isDisabled}
                  title={opt.label}
                  className={`flex flex-col items-center gap-1 transition-all duration-150 rounded-xl border-2 p-1.5 font-medium text-xs
                    ${
                      isActive
                        ? "border-orange-500 bg-orange-50 shadow-sm"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                          : "border-gray-200 dark:border-[#4a3f36] bg-white hover:border-gray-400"
                    }
                  `}
                >
                  {/* Color thumbnail image */}
                  {opt.image && (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100">
                      <Image
                        src={opt.image}
                        alt={opt.label}
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  {/* Color name label */}
                  <span
                    className={`text-[10px] leading-tight max-w-[56px] text-center truncate ${
                      isActive
                        ? "text-orange-700"
                        : "text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductColorVariants;
