"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Shop {
  id: string;
  name: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9.5" stroke="#D1D5DB" />
      <path
        d="M8.5 7L11.5 10L8.5 13"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ShopSelectorModalProps {
  shops: Shop[];
  onClose: () => void;
  onSelect: (shop: Shop) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShopSelectorModal({
  shops,
  onClose,
  onSelect,
}: ShopSelectorModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none px-6">
        <div className="relative w-full max-w-xs pointer-events-auto">
          {/* Close button — floats to the right of the list */}
          <button
            onClick={onClose}
            aria-label="Close shop selector"
            className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full
                       w-10 h-10 bg-[#1a1a1a] rounded-full
                       flex items-center justify-center
                       shadow-xl hover:bg-[#333] transition-colors duration-150 active:scale-95"
          >
            <CloseIcon />
          </button>

          {/* Shop option list */}
          <div className="flex flex-col gap-3">
            {shops.map((shop, index) => (
              <button
                key={`${shop.id}-${index}`}
                onClick={() => onSelect(shop)}
                className="w-full bg-white rounded-full px-5 py-3.5
                           flex items-center justify-between
                           shadow-md hover:shadow-lg hover:bg-gray-50
                           transition-all duration-150 active:scale-[0.98]"
              >
                <span className="text-sm font-medium text-gray-800 tracking-wide">
                  {shop.name}
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
