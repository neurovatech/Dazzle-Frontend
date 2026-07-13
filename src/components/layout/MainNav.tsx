"use client";
import Link from "next/link";
import Image from "next/image";
import { UserIcon, CartIcon } from "@/icon";
import { mainNavItems } from "./types";
import Logo from "@/images/logo.png";
import SearchBar from "../search/SearchBar";
import ThemeToggle from "./ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { useUserProfile, getInitials } from "@/hooks/useUserProfile";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NoImages from "@/images/no_images.png";
import { Users } from 'lucide-react';
import { useEffect, useRef, useState } from "react";

export default function MainNav() {
  const token = useAppSelector((state) => state.auth.token);
  const { data: profileData } = useUserProfile();
  const initials = profileData?.userFullName
    ? getInitials(profileData.userFullName)
    : null;
  const { data: siteSettings } = useSiteSettings();
  console.log(profileData, "profileData");
  const siteLogo = siteSettings?.siteLogo || Logo;

  // Redux থেকে cart item count নেওয়া
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Bounce animation state — cart-এ নতুন item যোগ হলে bounce করবে
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

  return (
    <div className="border-b border-white/5">
      <div className="max-w-350 mx-auto px-4">
        <div className="hidden md:flex items-center gap-6 py-4">
          <Link href="/" className="shrink-0 mr-2">
            <div className="text-3xl flex font-black text-white tracking-tighter leading-none">
              <Image
    src="https://dazzle.sgp1.cdn.digitaloceanspaces.com/site/header-logo-white.svg"
    width={130}
    height={30}
    alt="Dazzle logo"
    priority
  />
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
                href={token ? "/profile" : "/auth/login"}
                className="w-13.5 h-13.5 rounded-xl bg-background flex items-center justify-center overflow-hidden hover:bg-background/95 transition-all duration-200"
              >
                {/* DEB475 */}
                {token ? (
                  profileData?.userAvatar ? (
                    <Image
                      src={profileData.userAvatar}
                      alt={profileData?.userFullName || "User"}
                      width={54}
                      height={54}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                        <UserIcon className="text-primary_color" />
                  )
                ) : (
                  <UserIcon className="text-primary_color" />
                )}
              </Link>

              <Link
                href="/cart"
                className="relative w-13.5 h-13.5 rounded-xl bg-background flex items-center justify-center text-primary_color hover:bg-background/95 transition-all duration-200"
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

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
