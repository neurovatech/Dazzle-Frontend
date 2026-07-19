import Link from "next/link";
import { PhoneIcon, MapPinIcon } from "@/icon";
import { topNavItems } from "./types";

export default function TopBar() {
  return (
    <div className="hidden md:block">
      <div className="max-w-355 p-5 rounded-br-[10px] rounded-bl-[10px] mx-auto py-2 flex items-center justify-between bg-background text-black  transition-colors duration-300">
        <nav className="flex items-center gap-6">
          {topNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-medium transition-colors bg-linear-to-r from-primary to-[#CB843B] text-transparent bg-clip-text hover:brightness-110 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <Link
            href="tel:09638001122"
            className="flex items-center gap-2 text-xs text-primary hover:text-black transition-colors dark:hover:text-[#ba975f]"
          >
            <PhoneIcon />
            <span>09638001122</span>
          </Link>
          <Link
            href="/shop-location"
            className="flex items-center gap-2 text-xs text-primary hover:text-black transition-colors dark:hover:text-[#ba975f]"
          >
            <MapPinIcon />
            <span>Store locations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}