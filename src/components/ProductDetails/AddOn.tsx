"use client";

import { HandDollar } from "@/icon";
import { useState } from "react";
import Image from "next/image";
import DeliveryBike from "@/images/delivery-bike.png";
import StarImg from "@/images/star.png";
import { ShieldCheck, Info } from "lucide-react";

interface AddOnItem {
  id: number;
  image: string;
  name: string;
  saveAmount: string;
  price: string;
}

const addOnItems: AddOnItem[] = [
  {
    id: 1,
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F39566%2FAnker-High-Speed-USB-C-Charger-20W-Price-in-bangladesh-1.jpg&w=96&q=75",
    name: "Anker High Speed USB C Charger 20W",
    saveAmount: "৳1,00,000",
    price: "৳1,00,000",
  },
  {
    id: 2,
    image:
      "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F39566%2FAnker-High-Speed-USB-C-Charger-20W-Price-in-bangladesh-1.jpg&w=96&q=75",
    name: "Anker High Speed USB C Charger 20W",
    saveAmount: "৳1,00,000",
    price: "৳1,00,000",
  },
];

const formatPrice = (n: number) => "৳" + n.toLocaleString("en-US");

export default function ProductAddOn() {
  const [selected, setSelected] = useState<number[]>([]);
  
  // 15. Bundle offer states (Mock out-of-stock simulation)
  const [isGlassOutOfStock, setIsGlassOutOfStock] = useState(false);
  const [bundleSelected, setBundleSelected] = useState(false);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="w-full bg-white dark:bg-[#1C1A17] p-4 rounded-2xl space-y-6">
      
      {/* ── Bundle Offer Section ── */}
      <div className="bg-[#FAF8F5] dark:bg-[#2C2925] border border-[#7B4F1E]/20 rounded-2xl p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#7B4F1E] dark:text-[#E9CCAE] flex items-center gap-1.5">
            📦 Special Bundle Offer
          </h3>
          {/* Demo toggle for out of stock simulation */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isGlassOutOfStock}
              onChange={(e) => {
                setIsGlassOutOfStock(e.target.checked);
                if (e.target.checked) setBundleSelected(false);
              }}
              className="w-3.5 h-3.5 text-red-650 rounded border-gray-300 focus:ring-red-500"
            />
            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
              Simulate Glass Out of Stock
            </span>
          </label>
        </div>

        {/* Bundle Content details */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
          <p className="dark:text-white">Get the complete kit and save big:</p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-700 dark:text-gray-350">
            <li className="dark:text-white/70">1x Premium Phone Protector Case</li>
            <li className="dark:text-white/70">1x Dazzle Privacy Screen Guard</li>
          </ul>
        </div>

        {/* Warning Banner if out of stock */}
        {isGlassOutOfStock ? (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-900/40 flex items-start gap-2 text-xs">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>Bundle unavailable: Dazzle Privacy Screen Guard is currently Out of Stock in Banani flagship store.</span>
          </div>
        ) : (
          <label
            className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
              bundleSelected
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#34302C] hover:border-[#7B4F1E]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bundleSelected}
                onChange={(e) => setBundleSelected(e.target.checked)}
                className="w-4 h-4 text-emerald-650 rounded border-gray-300 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <p className="font-bold text-gray-800 dark:text-white">Buy Bundle Deal (+৳1,500)</p>
                <p className="text-gray-400">Regular price: ৳3,000 (You save 50%)</p>
              </div>
            </div>
            {bundleSelected && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-0.5">
                <ShieldCheck size={10} /> Bundle Applied!
              </span>
            )}
          </label>
        )}
      </div>

      {/* Add On Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add On</h2>
          <span className="text-orange-500 text-lg">
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 17C0.71667 17 0.479337 16.904 0.288004 16.712C0.0966702 16.52 0.000670115 16.2827 3.44827e-06 16C-0.000663218 15.7173 0.0953369 15.48 0.288004 15.288C0.48067 15.096 0.718003 15 1 15H2V8C2 6.61667 2.41667 5.38767 3.25 4.313C4.08334 3.23834 5.16667 2.534 6.5 2.2V1.5C6.5 1.08334 6.646 0.729336 6.938 0.438002C7.23 0.146669 7.584 0.000668939 8 2.27273e-06C8.416 -0.000664394 8.77034 0.145336 9.063 0.438002C9.35567 0.730669 9.50134 1.08467 9.5 1.5V2.2C10.8333 2.53334 11.9167 3.23767 12.75 4.313C13.5833 5.38834 14 6.61734 14 8V15H15C15.2833 15 15.521 15.096 15.713 15.288C15.905 15.48 16.0007 15.7173 16 16C15.9993 16.2827 15.9033 16.5203 15.712 16.713C15.5207 16.9057 15.2833 17.0013 15 17H1ZM8 20C7.45 20 6.97934 19.8043 6.588 19.413C6.19667 19.0217 6.00067 18.5507 6 18H10C10 18.55 9.80434 19.021 9.413 19.413C9.02167 19.805 8.55067 20.0007 8 20ZM8.713 10.713C8.90434 10.521 9 10.2833 9 10V7C9 6.71667 8.904 6.47934 8.712 6.288C8.52 6.09667 8.28267 6.00067 8 6C7.71734 5.99934 7.48 6.09534 7.288 6.288C7.096 6.48067 7 6.718 7 7V10C7 10.2833 7.096 10.521 7.288 10.713C7.48 10.905 7.71734 11.0007 8 11C8.28267 10.9993 8.52034 10.9033 8.713 10.712M8 14C8.28334 14 8.521 13.904 8.713 13.712C8.905 13.52 9.00067 13.2827 9 13C8.99934 12.7173 8.90334 12.48 8.712 12.288C8.52067 12.096 8.28334 12 8 12C7.71667 12 7.47934 12.096 7.288 12.288C7.09667 12.48 7.00067 12.7173 7 13C6.99934 13.2827 7.09534 13.5203 7.288 13.713C7.48067 13.9057 7.718 14.0013 8 14Z"
                fill="url(#paint0_linear_2182_49903)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_2182_49903"
                  x1="8"
                  y1="0"
                  x2="8"
                  y2="20"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#F44336" />
                  <stop offset="1" stopColor="#FF9800" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Buy more save more
          </span>
        </div>

        {/* Add On Items */}
        <div className="flex flex-col gap-3">
          {addOnItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 bg-white dark:bg-[#25221F] hover:border-gray-300 dark:hover:border-gray-700"
            >
              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected.includes(item.id)
                    ? "border-orange-500 bg-orange-500"
                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#34302C]"
                }`}
              >
                {selected.includes(item.id) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Product Image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:flex w-full items-center">
                {/* Product Name */}
                <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug pb-3 lg:pb-0">
                  {item.name}
                </p>
                {/* Save + Price */}
                <div className="text-right shrink-0">
                  <div className="text-right flex items-center gap-3 shrink-0 space-y-0.5">
                    <p className="text-xs flex gap-1 items-center text-orange-500 font-medium bg-[#FF98000F] py-2 px-3 rounded-[10px]">
                      <HandDollar /> Save{" "}
                      {formatPrice(parseInt(item.price.replace(/[^\d]/g, "")))}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatPrice(parseInt(item.price.replace(/[^\d]/g, "")))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 lg:gap-3 gap-1">
        {/* Estimated Delivery */}
        <div className="bg-[#FFFCD3] dark:bg-amber-950/20 rounded-2xl lg:p-4 p-2 flex flex-col items-center text-center">
          <Image
            src={DeliveryBike.src}
            width={24}
            height={24}
            alt="Picture of the author"
          />
          <p className="lg:text-xs text-[10px] text-[#222222] dark:text-gray-300 my-1">Estimated Delivery</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">0-3 Days</p>
        </div>

        {/* Purchase Point */}
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl lg:p-4 p-2 flex flex-col items-center text-center">
          <span className="text-2xl mb-2">
            <Image
              src={StarImg.src}
              width={24}
              height={24}
              alt="Picture of the author"
            />
          </span>
          <p className="lg:text-xs text-[10px] text-[#222222] dark:text-gray-300 my-1">Purchase Point</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">100</p>
        </div>

        {/* Minimum Booking Amount */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl lg:p-4 p-2 flex flex-col items-center text-center">
          <div className="relative mb-2">
            <span className="text-2xl">🔒</span>
            <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          </div>
          <p className="lg:text-xs text-[10px] text-[#222222] dark:text-gray-300 my-1">Minimum Booking Amount</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">৳15,000</p>
        </div>
      </div>
    </div>
  );
}
