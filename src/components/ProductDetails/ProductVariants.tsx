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
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ groups }) => {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((g) => [g.label, g.options[0]?.value ?? ""]))
  );

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2 flex gap-3 my-5  lg:px-5 pt-[10px] dark:border-[#4a3f36]">
          <p className="text-sm font-semibold text-[#222222] pt-2.5 dark:text-white">{group.label}:</p>
          <div className="flex flex-wrap gap-2 ">
            {group.options.map((opt) => {
              const isActive = selected[group.label] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [group.label]: opt.value }))
                  }
                  className={`flex items-center gap-1.5 transition-all duration-150 rounded-xl border-2 font-medium text-sm
                    ${
                      isActive
                        ? " border-[#E9CCAE] bg-[#E9CCAE] dark:text-black shadow-sm"
                        : " border-[#EEEEEE] bg-white  text-gray-600 hover:shadow-sm"
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