"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeColor?: string;
};

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#c9a96e" : "#9ca3af"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <rect
      x="9"
      y="9"
      width="2"
      height="2"
      rx="0.5"
      fill={active ? "#c9a96e" : "#9ca3af"}
      stroke="none"
    />
  </svg>
);

const OfferIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Box bottom */}
    <rect
      x="4"
      y="12"
      width="16"
      height="8"
      rx="1.5"
      fill={active ? "#f59e0b" : "#9ca3af"}
    />
    {/* Lid */}
    <rect
      x="3"
      y="9"
      width="18"
      height="4"
      rx="1.5"
      fill={active ? "#f59e0b" : "#6b7280"}
    />
    {/* Ribbon vertical on box */}
    <rect
      x="11"
      y="12"
      width="2"
      height="8"
      fill={active ? "#fde68a" : "#e5e7eb"}
    />
    {/* Ribbon horizontal on lid */}
    <rect
      x="3"
      y="10.5"
      width="18"
      height="1.5"
      fill={active ? "#fde68a" : "#e5e7eb"}
    />
    {/* Bow left */}
    <path
      d="M12 9 C10 7, 7 7, 7 9 C7 11, 10 11, 12 9Z"
      fill={active ? "#fde68a" : "#d1d5db"}
    />
    {/* Bow right */}
    <path
      d="M12 9 C14 7, 17 7, 17 9 C17 11, 14 11, 12 9Z"
      fill={active ? "#fde68a" : "#d1d5db"}
    />
  </svg>
);

const CategoriesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="4"
      width="7"
      height="7"
      rx="1.5"
      fill={active ? "#c9a96e" : "#9ca3af"}
    />
    <rect
      x="13"
      y="4"
      width="7"
      height="7"
      rx="1.5"
      fill={active ? "#c9a96e" : "#9ca3af"}
    />
    <rect
      x="4"
      y="13"
      width="7"
      height="7"
      rx="1.5"
      fill={active ? "#c9a96e" : "#9ca3af"}
    />
    {/* Dotted bottom-right */}
    <rect x="13" y="13" width="3" height="3" rx="0.8" fill={active ? "#c9a96e" : "#9ca3af"} />
    <rect x="17" y="13" width="3" height="3" rx="0.8" fill={active ? "#c9a96e" : "#9ca3af"} />
    <rect x="13" y="17" width="3" height="3" rx="0.8" fill={active ? "#c9a96e" : "#9ca3af"} />
    <rect x="17" y="17" width="3" height="3" rx="0.8" fill={active ? "#c9a96e" : "#9ca3af"} />
  </svg>
);

const PreorderIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "#c9a96e" : "#9ca3af"}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.12988 2.78125H16.8652C17.5874 2.7813 18.2562 3.11898 18.666 3.67285L20.8096 6.57129V6.57227C21.0748 6.93015 21.2139 7.35481 21.2139 7.78906L21.2178 19.1094C21.2178 20.2522 20.2486 21.2178 19.0127 21.2178H4.9873C3.75142 21.2178 2.78125 20.2522 2.78125 19.1094V7.78906C2.78125 7.35888 2.92226 6.93343 3.18555 6.57227L5.33301 3.67285C5.74304 3.1186 6.41265 2.78134 7.12988 2.78125ZM6.65234 4.5332L5.14844 6.56445L4.44043 7.52148H19.5635L18.8555 6.56445L17.3516 4.5332L17.1719 4.29004H6.83203L6.65234 4.5332Z"
      stroke="#E7E7E7"
      strokeWidth="1.2"
    />
    <path d="M7.63672 14.1819L10.364 16.9092L16.364 10.9092" stroke="#E7E7E7" />
  </svg>
);

const CartIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "#c9a96e" : "#9ca3af"}
    xmlns="http://www.w3.org/2000/svg"
    //   className={className}
  >
    <path
      d="M3.86428 16.455C3.00628 13.023 2.57728 11.308 3.47828 10.154C4.37928 9 6.14828 9 9.68528 9H14.3153C17.8533 9 19.6213 9 20.5223 10.154C21.4233 11.308 20.9943 13.024 20.1363 16.455C19.5903 18.638 19.3183 19.729 18.5043 20.365C17.6903 21 16.5653 21 14.3153 21H9.68528C7.43528 21 6.31028 21 5.49628 20.365C4.68228 19.729 4.40928 18.638 3.86428 16.455Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M19.5 9.5L18.79 6.895C18.516 5.89 18.379 5.388 18.098 5.009C17.8178 4.63246 17.4373 4.3424 17 4.172C16.56 4 16.04 4 15 4M4.5 9.5L5.21 6.895C5.484 5.89 5.621 5.388 5.902 5.009C6.18218 4.63246 6.56269 4.3424 7 4.172C7.44 4 7.96 4 9 4"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M9 4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4C15 4.26522 14.8946 4.51957 14.7071 4.70711C14.5196 4.89464 14.2652 5 14 5H10C9.73478 5 9.48043 4.89464 9.29289 4.70711C9.10536 4.51957 9 4.26522 9 4Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M8 13V17V13ZM16 13V17V13ZM12 13V17V13Z"
      fill={active ? "#c9a96e" : "#9ca3af"}
    />
    <path
      d="M8 13V17M16 13V17M12 13V17"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: null },
  { id: "offer", label: "Offer", icon: null },
  { id: "categories", label: "Category", icon: null },
  { id: "pre-order", label: "Pre-order", icon: null },
  { id: "cart", label: "Cart", icon: null },
];

export default function MobileFooter() {
  const [active, setActive] = useState("home");

  const renderIcon = (id: string) => {
    const isActive = active === id;
    switch (id) {
      case "home":
        return <HomeIcon active={isActive} />;
      case "offer":
        return <OfferIcon active={isActive} />;
      case "categories":
        return <CategoriesIcon active={isActive} />;
      case "pre-order":
        return <PreorderIcon active={isActive} />;
      case "cart":
        return <CartIcon active={isActive} />;
    }
  };

  return (
    <div className="fixed bottom-0 z-10 w-full flex justify-center p-3">
      <nav
        className="grid grid-cols-5 gap-1 px-2 py-2 w-full rounded-[28px]"
        style={{
          background: "#1c1a17",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <Link
              href={item.id === "home" ? "/" : item.id}
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                w-full flex flex-col items-center justify-center gap-1
                py-2 rounded-[18px]
                transition-all duration-300 ease-out
                ${isActive ? "bg-[#2a2520]" : "hover:bg-[#232018]"}
            `}
              style={
                isActive
                  ? {
                      boxShadow:
                        "0 2px 16px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }
                  : {}
              }
            >
              {/* Icon */}
              <div
                className="transition-transform duration-300"
                style={{
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              >
                {renderIcon(item.id)}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-medium tracking-wide whitespace-nowrap"
                style={{
                  color: isActive ? "#c9a96e" : "#6b7280",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
