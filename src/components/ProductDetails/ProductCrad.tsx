"use client";

import Image from "next/image";
import NoImg from "@/images/no_images.png";

interface ProductCardProps {
  image?: string;
  name?: string;
  inStock?: boolean;
  price?: string;
  originalPrice?: string;
  onAdd?: () => void;
}

export default function ProductCard({
  image,
  name = "Belkin USB C 7 in 1 Multiport...",
  inStock = true,
  price = "৳1,00,000",
  originalPrice = "৳1,30,000",
  onAdd,
}: ProductCardProps) {
  const hasImage = Boolean(image && image.trim() !== "");

  return (
    <div className="w-full h-full bg-white dark:bg-[#1f1a16] border border-[#E7E7E7] dark:border-[#3a2f28] rounded-[10px] p-3 flex flex-col font-sans transition-colors duration-200">
      <div className="relative rounded-2xl flex items-center justify-center h-10 mb-3 overflow-visible">
        <Image
          src={hasImage ? (image as string) : NoImg}
          alt={name}
          fill
          className="object-contain rounded-2xl"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>

      {/* Content */}
      <div className="pt-5 px-1 flex flex-col flex-1">
        <p className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-snug mb-1">
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
