/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import ShopSelectorButton from "./ShopSelectorButton";
import ShopSelectorModal, { type Shop } from "./ShopSelectorModal";

// ─── Shop data ────────────────────────────────────────────────────────────────
const shops: Shop[] = [
  { id: "1", name: "Safe Sealed" },
  { id: "2", name: "Dazzle Life-style" },
  { id: "3", name: "Safe Sealed" },
];

// ─── Main exported component ──────────────────────────────────────────────────
// Thin orchestrator: holds state, wires ShopSelectorButton ↔ ShopSelectorModal
export default function ShopSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  // Guard portal usage until after client hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when popup is open, restore exact position on close
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
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setIsOpen(false);
  };

  // selectedShop is available for future use (e.g. filtering products by shop)
  void selectedShop;

  return (
    <>
      {/* Floating trigger button */}
      <ShopSelectorButton onClick={handleOpen} />

      {/* Portal modal — only rendered on the client after hydration */}
      {mounted && isOpen && (
        <ShopSelectorModal
          shops={shops}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}
