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
      {groups.map((group) => {
        const selectedLabel = selectedValues[group.label] ?? "";
        return (
          <div
            key={group.label}
            className="lg:px-5 border-b border-[#e7e7e7] dark:border-[#4a3f36] pb-4 mb-1"
          >
            {/* Label row — "Color: White" */}
            <p className="text-sm font-semibold text-[#222222] dark:text-white mb-3">
              {group.label}
              {selectedLabel && (
                <span className="font-normal text-gray-500 dark:text-gray-300 ml-1">
                  : {selectedLabel}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isActive   = selectedValues[group.label] === opt.value;
                const isDisabled = opt.disabled === true;
                const hasImage   = !!opt.image?.trim();

                return (
                  <button
                    key={opt.value}
                    onClick={() => !isDisabled && handleSelect(group.label, opt.value)}
                    disabled={isDisabled}
                    title={opt.label}
                    className={`flex flex-col items-center gap-1 transition-all duration-150 rounded-xl border-2 font-medium
                      ${hasImage ? "p-1.5" : "px-3 py-2"}
                      ${
                        isActive
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : isDisabled
                            ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                            : "border-gray-200 dark:border-[#4a3f36] bg-white dark:bg-[#2a2420] hover:border-gray-400"
                      }
                    `}
                  >
                    {hasImage && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100">
                        <Image
                          src={opt.image!}
                          alt={opt.label}
                          fill
                          sizes="40px"
                          className="object-contain p-0.5"
                        />
                      </div>
                    )}

                    {/* Color name */}
                    {/* <span
                      className={`text-[11px] leading-tight text-center ${
                        hasImage ? "max-w-[60px] truncate" : "text-sm"
                      } ${
                        isActive
                          ? "text-orange-700 dark:text-orange-400 font-semibold"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {opt.label}
                    </span> */}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductColorVariants;
