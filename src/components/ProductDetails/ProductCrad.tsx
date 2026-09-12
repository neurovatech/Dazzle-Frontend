"use client";

import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import NoImg from "@/images/no_images.png";

interface ProductCardProps {
  image?: string;
  name?: string;
  inStock?: boolean;
  price?: string;
  originalPrice?: string;
  onAdd?: () => void;
  adding?: boolean;
  /** Already in the cart — shows a persistent green "Added!" pill instead of "Add". */
  added?: boolean;
}

export default function ProductCard({
  image,
  name = "Belkin USB C 7 in 1 Multiport...",
  inStock = true,
  price = "৳1,00,000",
  originalPrice = "৳1,30,000",
  onAdd,
  adding = false,
  added = false,
}: ProductCardProps) {
  const hasImage = Boolean(image && image.trim() !== "");

  return (
    <div className="w-full h-full bg-white dark:bg-[#1f1a16] rounded-2xl p-3 flex flex-col font-sans transition-colors duration-200">
      <div className="relative rounded-xl bg-[#fff] dark:bg-[#2e2b28] h-35 mb-4">
        <Image
          src={hasImage ? (image as string) : NoImg}
          alt={name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 300px"
        />

        {added ? (
          <span
            className="absolute -bottom-3 right-3 flex items-center gap-1.5 bg-[#1DBF56] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md"
          >
            <Check size={14} />
            Added!
          </span>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={!inStock || adding || !onAdd}
            aria-label={`Add ${name} to cart`}
            className="absolute -bottom-3 right-3 flex items-center gap-1.5 bg-white dark:bg-[#1f1a16] border border-[#D4A97A] text-[#B57908] dark:text-[#D4A97A] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#FBF3E9] dark:hover:bg-[#342a20] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#1f1a16]"
          >
            <ShoppingCart size={14} />
            {adding ? "Adding..." : "Add"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-1 flex flex-col flex-1">
        <p className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-snug mb-1 line-clamp-2">
          {name.replace("...", "")}{" "}
          {inStock ? (
            <span className="text-green-500 dark:text-green-400 font-semibold ml-1">
              In Stock
            </span>
          ) : (
            <span className="text-red-500 dark:text-red-400 font-semibold ml-1">
              Out of Stock
            </span>
          )}
        </p>

        <div className="flex items-center gap-3 mt-auto pt-2">
          <span className="text-gray-900 dark:text-white text-[16px] font-bold">
            {price}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-[14px] line-through">
            {originalPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
