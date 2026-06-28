/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Image from "next/image";

interface ProductImageThumbnailsProps {
  images: string[];
  selected: number;
  onSelect: (index: number) => void;
}

const ProductImageThumbnails: React.FC<ProductImageThumbnailsProps> = ({
  images,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex gap-2.5 justify-center flex-wrap">
      {images.map((img, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-50 flex items-center justify-center ${
            selected === i
              ? "border-orange-500 shadow-md shadow-orange-100"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <div className="relative w-4/5 h-4/5">
            <Image
              src={img}
              alt={`Thumb ${i + 1}`}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProductImageThumbnails;
