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

const DescriptionProductDetails: React.FC<DescriptionProps> = ({
  description,
}) => {
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
    <div className="w-full">
      {/* Groups */}
      <div className="flex flex-col gap-4">
        {description ? (
          <div
            className="
    dark-html-content
    prose dark:prose-invert max-w-none text-sm 
    text-gray-800 dark:text-gray-100 
    p-5 bg-[#F7F7F7] dark:bg-[#1a1613] 
    rounded-2xl border border-gray-200 dark:border-[#3a2f28] 
    leading-relaxed

    [&_h1]:text-gray-900 dark:[&_h1]:!text-white
    [&_h2]:text-gray-900 dark:[&_h2]:!text-white
    [&_h3]:text-gray-800 dark:[&_h3]:!text-white
    [&_h4]:text-gray-800 dark:[&_h4]:!text-white
    [&_h5]:text-gray-800 dark:[&_h5]:!text-white
    [&_h6]:text-gray-800 dark:[&_h6]:!text-white

    [&_p]:text-gray-700 dark:[&_p]:!text-gray-200
    [&_span]:dark:!text-gray-200
    [&_div]:dark:!text-gray-200

    [&_li]:text-gray-700 dark:[&_li]:!text-gray-200
    [&_ul]:text-gray-700 dark:[&_ul]:!text-gray-200
    [&_ol]:text-gray-700 dark:[&_ol]:!text-gray-200
    [&_li::marker]:text-gray-500 dark:[&_li::marker]:!text-gray-200

    [&_strong]:text-gray-900 dark:[&_strong]:!text-white
    [&_b]:text-gray-900 dark:[&_b]:!text-white
    [&_em]:text-gray-700 dark:[&_em]:!text-gray-200
    [&_i]:text-gray-700 dark:[&_i]:!text-gray-200

    [&_a]:text-blue-600 dark:[&_a]:!text-[#D4A97A] dark:[&_a]:underline

    [&_blockquote]:text-gray-700 dark:[&_blockquote]:!text-gray-200
    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:!border-gray-500

    [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
    dark:[&_table]:!bg-[#1a1613]

    [&_thead]:dark:!bg-[#2a211c]
    [&_tr]:dark:!bg-transparent
    dark:[&_tr:nth-child(even)]:!bg-[#221a16]

    [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-100 [&_th]:text-left [&_th]:text-gray-900
    dark:[&_th]:!border-[#3a2f28] dark:[&_th]:!bg-[#2a211c] dark:[&_th]:!text-gray-100

    [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 [&_td]:text-gray-700
    dark:[&_td]:!border-[#3a2f28] dark:[&_td]:!bg-[#221a16] dark:[&_td]:!text-gray-200

    [&_code]:text-gray-800 dark:[&_code]:!text-gray-200
    [&_pre]:text-gray-800 dark:[&_pre]:!text-gray-200 dark:[&_pre]:!bg-[#2a211c]

    overflow-x-auto
  "
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
    </div>
  );
};

export default DescriptionProductDetails;
