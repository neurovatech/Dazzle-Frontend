"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserIcon,
  CartIcon,
  MobileMenuIcon,
  CloseIcon,
} from "@/icon";
import ExplorePanel from "./ExplorePanel";
import Logo from "@/images/logo.png";
import SearchBar from "@/components/search/SearchBar";
import { exploreCategories } from "./types";
import type { ApiCategory } from "./Header";
import { useAppSelector } from "@/store/hooks";
import { useTheme } from "next-themes";

interface Props {
  categories?: ApiCategory[];
}

export default function MobileHeader({ categories }: Props) {
  const token = useAppSelector((state) => state.auth.token);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    categories && categories.length > 0
      ? categories[0].category_name
      : (exploreCategories[0]?.label ?? "Phones")
  );
  const [selectedBrand, setSelectedBrand] = useState("");

  const { resolvedTheme } = useTheme();
  const iconColor = resolvedTheme === "dark" ? "#fff" : "#222";

  const menuRef = useRef<HTMLDivElement>(null);

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

  const panelCategories = categories && categories.length > 0 ? categories : exploreCategories;

  const panelProps = {
    categories: panelCategories,
    activeCategory,
    selectedBrand,
    onHoverCategory: setActiveCategory,
    onSelectBrand: setSelectedBrand,
  };

  return (
    <div className="md:hidden p-3" ref={menuRef}>
      {/* Top row */}
      <div className="flex items-center justify-between py-3.5">
        <Link href="/" className="shrink-0 mr-2">
          <div className="text-3xl flex font-black text-white tracking-tighter leading-none">
            <Image src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/header-logo-white.svg" width={130} height={30} alt="Dazzle logo" />
            <sup className="text-[10px] font-normal align-super ml-0.5 text-white">
              ™
            </sup>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={token ? "/profile" : "/auth/login"}
            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center"
          >
            <UserIcon className="text-primary_color dark:text-white" />
          </Link>

          <Link
            href="/cart" className="w-10 h-10 rounded-xl bg-white dark:bg-[#2e2b28] flex items-center justify-center">
            <CartIcon className="text-primary_color dark:text-white"  />
          </Link>
        </div>
      </div>

      {/* Search + menu */}
      <div className="flex pb-3 relative gap-4">
        <SearchBar />

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-300 dark:bg-[#2e2b28]"
        >
          {mobileMenuOpen ? <CloseIcon color={iconColor}   /> : <MobileMenuIcon color={iconColor} />}
        </button>
      </div>

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