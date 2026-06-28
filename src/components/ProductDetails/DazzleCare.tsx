"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { AddFileIcon, HandDollar } from "@/icon";

interface CareOption {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  icon: string;
}

interface DazzleCareProps {
  options: CareOption[];
}

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

const DazzleCare: React.FC<DazzleCareProps> = ({ options }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-[#222222] border border-gray-200 overflow-hidden dark:border-[#4a3f36]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#222222] hover:bg-[#222222]/70 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-white">
          <Shield size={17} className="text-orange-500" />
          Dazzle Care (Recommended)
        </div>
        {open ? (
          <ChevronUp size={17} className="text-gray-400" />
        ) : (
          <ChevronDown size={17} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-gray-100 p-3 pb-0! rounded-2xl">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center justify-center gap-3 px-3 py-3.5 cursor-pointer hover:bg-white transition-colors rounded-2xl mb-3 bg-white"
            >
              <input
                type="radio"
                name="dazzle-care"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
                className="mt-1 accent-black w-4 h-4 shrink-0"
              />
              <div className="w-9 h-9 bg-[#6D3F0E] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <AddFileIcon />
              </div>

              {/* Stack text + price vertically */}
              <div className="lg:flex min-w-0">
                <p className="text-sm lg:w-100 text-[#222222] mb-2">
                  <span className="font-semibold">{opt.title}:</span>{" "}
                  {opt.description}
                </p>

                {/* Price row stays on one line, moves under text on mobile */}
                <div className="flex items-center lg:gap-2 gap-1 flex-wrap">
                  <p className="lg:text-xs text-[10px] flex gap-1 items-center text-orange-500 font-medium bg-[#FF98000F] py-1.5 px-1 lg:px-2.5 rounded-[10px] whitespace-nowrap">
                    <HandDollar /> Save{" "}
                    {formatPrice(opt.originalPrice - opt.price)}
                  </p>
                  <p className="lg:text-sm text-[10px] font-bold text-gray-900">
                    {formatPrice(opt.price)}
                  </p>
                  <p className="lg:text-xs text-[10px] text-gray-400 line-through">
                    {formatPrice(opt.originalPrice)}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DazzleCare;
