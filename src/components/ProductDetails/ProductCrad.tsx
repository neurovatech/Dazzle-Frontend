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
    <div className="w-full bg-white dark:bg-[#1f1a16] border border-[#E7E7E7] dark:border-[#3a2f28] rounded-[10px] p-3 flex flex-col font-sans transition-colors duration-200">
      {/* Image Container */}
      <div className="relative rounded-2xl flex items-center justify-center h-50 mb-3 overflow-visible">
        <Image
          src={hasImage ? (image as string) : NoImg}
          alt={name}
          fill
          className="object-contain rounded-2xl"
          sizes="(max-width: 768px) 100vw, 300px"
        />

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="absolute -bottom-4 right-3 flex items-center gap-2 bg-white dark:bg-[#2a211c] border border-[#E9CCAE] dark:border-[#5a3f2a] shadow-md rounded-[10px] text-[#6D3F0E] dark:text-[#e3b48a] font-bold text-base hover:bg-orange-50 dark:hover:bg-[#3a2a20] transition-colors text-[14px] py-1 px-2"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.89426 10.5709C1.30301 8.20585 1.00738 7.02404 1.62826 6.22882C2.24914 5.43359 3.46817 5.43359 5.90552 5.43359H9.09607C11.5341 5.43359 12.7524 5.43359 13.3733 6.22882C13.9942 7.02404 13.6986 8.20654 13.1073 10.5709C12.7311 12.0752 12.5436 12.827 11.9827 13.2652C11.4218 13.7028 10.6465 13.7028 9.09607 13.7028H5.90552C4.35504 13.7028 3.5798 13.7028 3.01887 13.2652C2.45794 12.827 2.26982 12.0752 1.89426 10.5709Z"
              stroke="currentColor"
            />
            <path
              d="M12.6686 5.77835L12.1793 3.98323C11.9905 3.29069 11.8961 2.94476 11.7024 2.68359C11.5094 2.42411 11.2472 2.22423 10.9458 2.10681C10.6426 1.98828 10.2843 1.98828 9.56761 1.98828M2.33203 5.77835L2.82129 3.98323C3.01011 3.29069 3.10452 2.94476 3.29815 2.68359C3.49122 2.42411 3.75344 2.22423 4.05479 2.10681C4.35799 1.98828 4.71633 1.98828 5.43299 1.98828"
              stroke="currentColor"
            />
            <path
              d="M5.43359 1.98793C5.43359 1.80517 5.5062 1.62989 5.63543 1.50066C5.76466 1.37143 5.93993 1.29883 6.1227 1.29883H8.87911C9.06187 1.29883 9.23714 1.37143 9.36638 1.50066C9.49561 1.62989 9.56821 1.80517 9.56821 1.98793C9.56821 2.17069 9.49561 2.34597 9.36638 2.4752C9.23714 2.60443 9.06187 2.67703 8.87911 2.67703H6.1227C5.93993 2.67703 5.76466 2.60443 5.63543 2.4752C5.5062 2.34597 5.43359 2.17069 5.43359 1.98793Z"
              stroke="currentColor"
            />
            <path
              d="M4.74414 8.18945V10.9459M10.257 8.18945V10.9459M7.50055 8.18945V10.9459"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add
        </button>
      </div>

      {/* Content */}
      <div className="pt-5 px-1">
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

        <div className="flex items-center gap-3 mt-2">
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