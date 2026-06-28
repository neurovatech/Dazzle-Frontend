/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Shop {
  id: string;
  name: string;
}

const shops: Shop[] = [
  { id: "1", name: "Safe Sealed" },
  { id: "2", name: "Dazzle Life-style" },
  { id: "3", name: "Safe Sealed" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShopIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 11 Q26 4 35 11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20.5 15.5 Q26 10 31.5 15.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 23 L26 17 L43 23"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect
        x="11"
        y="23"
        width="30"
        height="19"
        rx="2"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      <rect
        x="20"
        y="30"
        width="12"
        height="12"
        rx="1.5"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="13"
        y="26"
        width="5"
        height="4"
        rx="1"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
      />
      <rect
        x="34"
        y="26"
        width="5"
        height="4"
        rx="1"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );
}

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

// ─── Popup rendered via React Portal ─────────────────────────────────────────
// Using a portal means the modal is appended to <body> and sits above ALL
// page stacking contexts — no z-index fight with any parent element.

function ShopPopup({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (shop: Shop) => void;
}) {
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

      {/* Popup content */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none px-6">
        <div className="relative w-full max-w-xs pointer-events-auto">
          {/* Close button floats to the right */}
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

          {/* Shop option buttons */}
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

// ─── Main exported component ──────────────────────────────────────────────────

export default function ShopSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  // Guard portal usage until after client hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when popup is open, restore exact scroll position on close
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      // Restore the exact scroll position the user was at
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setIsOpen(false);
  };

  return (
    <>
      {/* Inline trigger — no min-h-screen, no position:relative wrapper */}
      <div className="flex justify-center items-center fixed right-0 md:top-50 top-30 z-999">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleOpen}
            aria-label="Open shop selector"
            className="w-24 h-24 bg-[#1a1a1a] rounded-tl-full rounded-bl-full  flex items-center justify-center shadow-2xl hover:bg-[#2a2a2a] transition-colors duration-200 active:scale-95"
          >
            <ShopIcon />
          </button>

          {/* {selectedShop ? (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300
                             bg-white/80 dark:bg-white/10 backdrop-blur-sm
                             px-4 py-1.5 rounded-full shadow">
              {selectedShop.name}
            </span>
          ) : (
            <span className="text-xs text-gray-400 tracking-widest uppercase">
              Select Shop
            </span>
          )} */}
        </div>
      </div>

      {/* Portal modal — only active on the client after hydration */}
      {mounted && isOpen && (
        <ShopPopup onClose={handleClose} onSelect={handleSelect} />
      )}
    </>
  );
}
