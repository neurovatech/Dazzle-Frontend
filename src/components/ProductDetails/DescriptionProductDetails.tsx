"use client";
import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";

import ProductBanner from "@/images/Rectangle.png";

interface SpecItem {
  label: string;
  value: string;
}

interface SpecGroup {
  title: string;
  items: SpecItem[];
}

interface DescriptionProps {
  description?: string;
}

const DescriptionProductDetails: React.FC<DescriptionProps> = ({ description }) => {
  const [open, setOpen] = useState(true);
  const cards = [
    {
      variant: "white",
      title:
        "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
      description:
        "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop – your ultimate tech haven in Bangladesh.",
      wrapper: "bg-white border border-gray-200",
    },
    {
      variant: "purple",
      title:
        "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
      description:
        "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop – your ultimate tech haven in Bangladesh.",
      wrapper: "bg-[#EEEEFF] border border-[#DDDDF5]",
    },
    {
      variant: "green",
      title:
        "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
      description:
        "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop – your ultimate tech haven in Bangladesh.",
      wrapper: "bg-[#F0FAF4] border border-[#D9F0E3]",
    },
    {
      variant: "peach",
      title:
        "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
      description:
        "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop – your ultimate tech haven in Bangladesh.",
      wrapper: "bg-[#FFF6EE] border border-[#FFE8D0]",
    },
  ];

  return (
    <div className="w-full pt-4">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-4 text-base font-semibold text-gray-900 hover:text-gray-700 transition-colors dark:hover:text-gray-300 dark:text-white"
      >
        Description
        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {/* Groups */}
      {open && (
        <div className="flex flex-col gap-4">
          {description ? (
            <div 
              className="prose dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-205 p-5 bg-[#F7F7F7] dark:bg-[#1a1613] rounded-2xl border border-gray-200 dark:border-[#3a2f28] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <>
              <Image
                src={ProductBanner}
                width={500}
                height={500}
                alt="Picture of the author"
                className="w-full object-cover"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {cards.map((card, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-6 h-full ${card?.wrapper}`}
                  >
                    <h2 className="text-[17px] font-bold text-gray-900 leading-snug mb-3">
                      {card.title}
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionProductDetails;
