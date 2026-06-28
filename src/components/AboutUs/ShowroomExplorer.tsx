"use client";

import React, { useState } from "react";

interface Showroom {
  city: string;
  address: string;
  phone: string;
}

const showrooms: Showroom[] = [
  { city: "Dhaka", address: "Dazzle HQ, Level 4, Block C, Dhaka, Bangladesh", phone: "+880 1711-XXXXXX" },
  { city: "Dubai", address: "Dazzle Middle East, Sheikh Zayed Road, Dubai, UAE", phone: "+971 4 123 XXXX" },
  { city: "Hong Kong", address: "Dazzle Far East Ltd, Kowloon, Hong Kong", phone: "+852 2345 XXXX" },
  { city: "Singapore", address: "Dazzle Southeast Asia, Orchard Road, Singapore", phone: "+65 6789 XXXX" },
];

export default function ShowroomExplorer() {
  const [selectedCity, setSelectedCity] = useState("Dhaka");

  const currentShowroom = showrooms.find((s) => s.city === selectedCity) || showrooms[0];

  return (
    <div className="mt-8 p-6 bg-gray-50 dark:bg-[#1E1C1A] rounded-2xl border border-gray-150 dark:border-gray-800">
      <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-1">
        📍 Showroom Locations (Interactive Client Component)
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        এই অংশটি একটি **Client Component** (useState ব্যবহার করে ইন্টারেক্টিভ ট্যাব টগল করার জন্য)।
      </p>

      {/* City Toggles */}
      <div className="flex gap-2 flex-wrap mb-4">
        {showrooms.map((s) => (
          <button
            key={s.city}
            onClick={() => setSelectedCity(s.city)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              selectedCity === s.city
                ? "bg-[#D4A97A] text-black border-[#D4A97A] shadow-sm"
                : "bg-white dark:bg-[#2A2724] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#D4A97A]"
            }`}
          >
            {s.city}
          </button>
        ))}
      </div>

      {/* Address Block */}
      <div className="p-4 bg-white dark:bg-[#2A2724] rounded-xl border border-gray-150 dark:border-gray-750">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
          {currentShowroom.city} Outlet
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {currentShowroom.address}
        </p>
        <p className="text-xs text-[#D4A97A] font-semibold">
          Call: {currentShowroom.phone}
        </p>
      </div>
    </div>
  );
}
