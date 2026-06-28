"use client";
import React, { useState } from "react";

interface VariantOption {
  label: string;
  value: string;
  image?: string;
}

interface VariantGroup {
  label: string;
  type: "color" | "text";
  options: VariantOption[];
}

interface ProductVariantsProps {
  groups: VariantGroup[];
  onChange?: (selected: Record<string, string>) => void;
}

const ProductColorVariants: React.FC<ProductVariantsProps> = ({ groups, onChange }) => {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((g) => [g.label, g.options[0]?.value ?? ""]))
  );

  const handleSelect = (label: string, value: string) => {
    const next = { ...selected, [label]: value };
    setSelected(next);
    onChange?.(next);
  };

  return (
    <div className="">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2 flex gap-3 lg:px-5">
          <p className="text-sm font-semibold text-[#222222] pt-2.5 dark:text-white">{group.label} : </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const isActive = selected[group.label] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(group.label, opt.value)}
                  className={`flex items-center gap-1.5 transition-all duration-150 rounded-xl border-2 font-medium text-sm
                    ${
                      isActive
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                        : "border-gray-200 dark:border-[#4a3f36] bg-white text-gray-600 hover:border-gray-400"
                    }
                    ${group.type === "color" ? "p-1.5" : "px-3 py-1.5"}
                  `}
                >
                  {group.type === "color" && opt.image && (
                    <img
                      src={opt.image}
                      alt={opt.label}
                      className="w-7 h-7 rounded-lg object-contain bg-white border border-gray-100"
                    />
                  )}
                  {/* <span>{opt.label}</span> */}
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