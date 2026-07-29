/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import DescriptionProductDetails from "./DescriptionProductDetails";

interface SpecItem {
  label: string;
  value: string;
}

interface SpecGroup {
  title: string;
  items: SpecItem[];
}

interface ProductSpecificationsProps {
  groups: SpecGroup[];
  description?: any;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ groups: propGroups, description }) => {
  const [open, setOpen] = useState(true);
  const fallbackGroups: SpecGroup[] = [
    {
      title: "Body",
      items: [
        {
          label: "Dimension",
          value: "163.4 x 78 x 8.8 mm (6.43 x 3.07 x 0.35 in)",
        },
        { label: "Weight", value: "233 g (8.22 oz)" },
        {
          label: "Build",
          value:
            "Glass front (Ceramic Shield 2), aluminum alloy frame, aluminum alloy back/ glass back (Ceramic Shield)",
        },
        {
          label: "SIM",
          value:
            "Nano-SIM + eSIM + eSIM (max 2 at a time; International); eSIM + eSIM (8 or more, max 2 at a time; USA); Nano-SIM + Nano-SIM (China)",
        },
        {
          label: "Features",
          value:
            "IP68 dust tight and water resistant (immersible up to 6m for 30 min); Apple Pay (Visa, MasterCard, AMEX certified)",
        },
      ],
    },
    {
      title: "Display",
      items: [
        { label: "Type", value: "Super Retina XDR OLED" },
        { label: "Size", value: "6.9 inches" },
        { label: "Resolution", value: "1320 x 2868 pixels" },
      ],
    },
  ];

  const groups = propGroups && propGroups.length > 0 ? propGroups : fallbackGroups;

  return (
    <div className="w-full">
        <div className="flex flex-col gap-4">
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="rounded-2xl border border-gray-200 dark:border-[#3a2f28] overflow-hidden bg-white dark:bg-[#1f1a16] transition-colors"
            >
              {/* Group title */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-[#2a211c] border-b border-gray-200 dark:border-[#3a2f28]">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {group.title}
                </span>
              </div>

              {/* Spec rows */}
              <div className="divide-y divide-gray-100 dark:divide-[#3a2f28] bg-[#F7F7F7] dark:bg-[#171210] p-3">
                {group.items.map((item, ii) => (
  <div
    key={ii}
    className="grid grid-cols-[80px_1fr] sm:grid-cols-[200px_1fr] px-5 md:py-3.5 py-1 gap-3 sm:gap-4 bg-white dark:bg-[#221a16] mb-1 rounded-lg transition-colors"
  >
    <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {item.label}
    </span>

    <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
      {item.value}
    </span>
  </div>
))}
              </div>
            </div>
          ))}
        </div>

    </div>
  );
};

export default ProductSpecifications;
