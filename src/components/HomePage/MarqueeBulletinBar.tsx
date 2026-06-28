"use client";

import React from "react";

interface MarqueeItem {
  icon: React.ReactNode;
  text: string;
}

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-4 h-4 sm:w-5 sm:h-5 inline-block"
    fill="none"
  >
    {/* Calendar base */}
    <rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="2"
      fill="#fff"
      stroke="#d94f3d"
      strokeWidth="1.5"
    />
    {/* Top bar */}
    <rect x="3" y="4" width="18" height="6" rx="2" fill="#d94f3d" />
    {/* Binding pins */}
    <rect x="8" y="2" width="2" height="4" rx="1" fill="#b33a2a" />
    <rect x="14" y="2" width="2" height="4" rx="1" fill="#b33a2a" />
    {/* Grid dots */}
    <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#d94f3d" />
    <rect x="11" y="13" width="2" height="2" rx="0.5" fill="#d94f3d" />
    <rect x="15" y="13" width="2" height="2" rx="0.5" fill="#d94f3d" />
    <rect x="7" y="17" width="2" height="2" rx="0.5" fill="#d94f3d" />
    <rect x="11" y="17" width="2" height="2" rx="0.5" fill="#d94f3d" />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-4 h-4 sm:w-5 sm:h-5 inline-block"
    fill="#f5c518"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const marqueeItems: MarqueeItem[] = [
  { icon: <CalendarIcon />, text: "Since 2018" },
  { icon: <StarIcon />, text: "5000+ Reviews" },
  { icon: <CalendarIcon />, text: "Since 2018" },
  { icon: <StarIcon />, text: "5000+ Reviews" },
  { icon: <CalendarIcon />, text: "Since 2018" },
  { icon: <StarIcon />, text: "5000+ Reviews" },
  { icon: <CalendarIcon />, text: "Since 2018" },
  { icon: <StarIcon />, text: "5000+ Reviews" },
];

export default function MarqueeBulletinBar() {
  // Duplicate items to create seamless infinite loop
  const repeated = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative w-full overflow-hidden select-none mb-2 py-3">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-24 bg-linear-to-r from-light_bg  to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-24 bg-linear-to-l from-light_bg to-transparent" />

      <div className="flex items-center marquee-track">
        {repeated.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 group whitespace-nowrap shrink-0 cursor-pointer justify-center border-r      border-[#E7E7E7]  dark:border-white/10"
          >
            <span className="shrink-0 pb-1">{item.icon}</span>

            <span className="text-primary dark:text-white font-medium text-xs sm:text-sm group-hover:font-bold tracking-wide">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
