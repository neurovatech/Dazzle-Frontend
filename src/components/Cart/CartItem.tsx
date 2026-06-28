"use client";

import { X } from "lucide-react";

type CartItemProps = {
  id: number;
  brand: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  quantity: number;
  inStock: boolean;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
};

export default function CartItem({
  id,
  brand,
  name,
  price,
  originalPrice,
  image,
  quantity,
  inStock,
  onIncrease,
  onDecrease,
}: CartItemProps) {
  return (
    <div className="flex items-center gap-4 py-5 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors">
      
      {/* Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-100 dark:bg-[#1f1a16] rounded-xl overflow-hidden flex items-center justify-center group">
        
        {/* Close Icon */}
        <button
          className=" absolute  top-1 left-1  z-10 w-6 h-6 rounded-full bg-white/90 dark:bg-[#2a211c] backdrop-blur-sm shadow-md
            flex
            items-center
            justify-center
            transition-all
            duration-300
            hover:bg-red-500
            hover:text-white
            hover:scale-110
            text-gray-700
            dark:text-gray-300
          "
        >
          <X size={14} strokeWidth={2} />
        </button>

        {/* Product Image */}
        <img
          src={image}
          alt={name}
          className="
            w-full
            h-full
            object-contain
            p-2
            transition-transform
            duration-300
            group-hover:scale-105
          "
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/80x80/f3f4f6/9ca3af?text=Product";
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#E6A817]">{brand}</p>

        <p className="text-sm text-gray-800  truncate">
          {name}
        </p>

        <p className="text-base font-bold dark:text-black mt-1">
          ৳ {price}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
          ৳ {originalPrice}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        
        {inStock && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            In Stock
          </span>
        )}

        <div className="flex items-center gap-2">
          
          <button
            onClick={() => onDecrease(id)}
            className="
              w-7 h-7
              rounded-full
              border border-gray-300 dark:border-gray-700
              flex items-center justify-center
              text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
              text-base font-medium
            "
          >
            −
          </button>

          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-4 text-center">
            {quantity}
          </span>

          <button
            onClick={() => onIncrease(id)}
            className="
              w-7 h-7
              rounded-full
              border border-gray-300 dark:border-gray-700
              bg-gray-800 dark:bg-gray-700
              flex items-center justify-center
              text-white
              hover:bg-gray-900 dark:hover:bg-gray-600
              transition
              text-base font-medium
            "
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}