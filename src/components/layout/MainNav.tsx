"use client";

import Link from "next/link";
import Image from "next/image";
import { UserIcon, CartIcon, MoonIcon, SunIcon } from "@/icon";
import { mainNavItems } from "./types";
import Logo from "@/images/logo.png";
import SearchBar from "../search/SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function MainNav() {
  return (
    <div className="border-b border-white/5">
      <div className="max-w-350 mx-auto px-4">
        <div className="hidden md:flex items-center gap-6 py-4">
          <Link href="/" className="shrink-0 mr-2">
            <div className="text-3xl flex font-black text-white tracking-tighter leading-none">
              <Image src={Logo} width={130} height={30} alt="Dazzle logo" />
              <sup className="text-[10px] font-normal align-super ml-0.5 text-gray-400">
                ™
              </sup>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {mainNavItems.map((item) => (
              <div key={item.label} className="relative">
                <Link
                  href={item.href}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium
                    ${
                      item.badge
                        ? "border border-[#DEB475] text-white hover:bg-[#C084FC]/10 bg-[#FFC04A4D]"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.label}
                </Link>
                {item.badgeCount && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] bg-[#6B21A8] text-white px-2 py-0.5 rounded whitespace-nowrap font-medium">
                    {item.badgeCount}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Search bar */}
          <SearchBar />
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-3 mr-12.5">
              <Link
                href="/profile"
                className="w-13.5 h-13.5 rounded-xl bg-background flex items-center justify-center text-primary_color hover:bg-background/95 transition-all duration-200"
              >
                <UserIcon className="text-primary_color" />
              </Link>

              <Link
                href="/cart"
                className="w-13.5 h-13.5 rounded-xl bg-background flex items-center justify-center text-primary_color hover:bg-background/95 transition-all duration-200"
              >
                <CartIcon />
              </Link>
            </div>

            <ThemeToggle />
            {/* <button
              onClick={onToggleDark}
              className="w-13.5 h-13.5 rounded-xl bg-[#E9CCAE47] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#333] transition-all duration-200"
            >
              {darkMode ? <MoonIcon /> : <SunIcon />}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
