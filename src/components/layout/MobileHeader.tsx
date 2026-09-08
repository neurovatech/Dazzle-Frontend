/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserIcon,
  CartIcon,
  MobileMenuIcon,
  CloseIcon,
  Locationicon,
  ChevronDownIcon,
} from "@/icon";
import ExplorePanel from "./ExplorePanel";

import SearchBar from "@/components/search/SearchBar";
import { exploreCategories } from "./types";
import type { ApiCategory } from "./Header";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";

interface Props {
  categories?: ApiCategory[];
}

export default function MobileHeader({ categories }: Props) {
  const token = useAppSelector((state) => state.auth.token);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    categories && categories.length > 0
      ? categories[0].category_name
      : (exploreCategories[0]?.label ?? "Phones"),
  );
  const [selectedBrand, setSelectedBrand] = useState("");

  const { resolvedTheme } = useTheme();
  const iconColor = resolvedTheme === "dark" ? "#fff" : "#222";

  const menuRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection: collapse to just the top row on scroll down, expand
  // back to the full header (search + menu) on scroll up. Same pattern as
  // MobileFooter's big/small toggle.
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;

        // Only move the baseline forward once we've actually acted on a
        // scroll of at least the threshold — not on every frame. Momentum
        // scrolling on phones delivers scroll events with tiny back-and-forth
        // deltas (a few px each way) as it decelerates; comparing every frame
        // to the frame right before it made isCompact flip on and off rapidly
        // during that settling, which read as the header visibly shaking.
        // Requiring a full 6px of NET movement since the last flip (rather
        // than since the last frame) absorbs that jitter.
        if (diff > 6 && currentY > 60) {
          setIsCompact(true);
          lastScrollY.current = currentY;
        } else if (diff < -6) {
          setIsCompact(false);
          lastScrollY.current = currentY;
        }

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.length;

  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 600);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const panelCategories =
    categories && categories.length > 0 ? categories : exploreCategories;

  const panelProps = {
    categories: panelCategories,
    activeCategory,
    selectedBrand,
    onHoverCategory: setActiveCategory,
    onSelectBrand: setSelectedBrand,
  };

  return (
    <div className="md:hidden lg:p-3 px-4 relative" ref={menuRef}>
      {/* Top row */}
      <div className="flex items-center justify-between lg:py-3.5 pb-3.5 pt-2">
        <Link href="/" className="shrink-0 mr-2">
          <div className="text-3xl flex font-black text-white tracking-tighter leading-none">
            <Image
              src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/header-logo-white.svg"
              width={150}
              height={50}
              alt="Dazzle logo"
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle className="w-10 h-10" />

          <Link
            href="/shop-location"
             aria-label="Shop location"
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-[#222222] dark:text-white"
          >
            <Locationicon aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-xl bg-white dark:bg-[#2e2b28] flex items-center justify-center"
          >
            <span className={bounce ? "animate-bounce" : ""}>
              <CartIcon />
            </span>
            {cartCount > 0 && (
              <span
                className={`
                      absolute -top-1.5 -right-1.5
                      min-w-[20px] h-5 px-1
                      bg-[#E6A817] text-white
                      text-[10px] font-extrabold
                      rounded-full
                      flex items-center justify-center
                      shadow-md
                      ${bounce ? "animate-bounce" : ""}
                    `}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search + menu — hidden while the header is collapsed to its compact form */}
      {!isCompact && (
        <div className="flex pb-3 relative gap-2">
          <SearchBar />

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-300 dark:bg-[#2e2b28]"
          >
            {mobileMenuOpen ? (
              <CloseIcon color={iconColor} aria-hidden="true" />
            ) : (
              <MobileMenuIcon color={iconColor} aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {/* Compact-mode expand toggle */}
      {isCompact && (
        <div className="flex justify-center pb-2">
          <button
            onClick={() => setIsCompact(false)}
            aria-label="Expand header"
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#2e2b28] flex items-center justify-center text-[#222] dark:text-white shadow-md"
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      {/* Explore Panel */}
      <ExplorePanel
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isMobile={true}
        {...panelProps}
      />
    </div>
  );
}
