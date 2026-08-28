/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Image from "next/image";
import { toGalleryImages, type GalleryImage } from "./utils";

interface ProductImageThumbnailsProps {
  images: (string | GalleryImage)[];
  selected: number;
  onSelect: (index: number) => void;
}

const ProductImageThumbnails: React.FC<ProductImageThumbnailsProps> = ({
  images,
  selected,
  onSelect,
}) => {
  const items = toGalleryImages(images);

  return (
    <div className="flex gap-2.5 justify-center flex-wrap pb-5 lg:pb-0">
      {items.map((item, i) => {
        const isDisabled = item.disabled === true;
        const isActive = selected === i;

        return (
          <button
            key={`${item.url}-${i}`}
            type="button"
            onClick={() => !isDisabled && onSelect(i)}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label={
              item.color
                ? `${item.color}${isDisabled ? " (unavailable)" : ""}`
                : `Product image ${i + 1}`
            }
            title={
              item.color
                ? `${item.color}${isDisabled ? " — unavailable" : ""}`
                : undefined
            }
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-50 flex items-center justify-center ${
              isActive
                ? "border-orange-500 shadow-md shadow-orange-100"
                : isDisabled
                  ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="relative w-4/5 h-4/5">
              <Image
                src={item.url}
                alt={item.color || `Thumb ${i + 1}`}
                fill
                className={`object-contain ${isDisabled ? "grayscale" : ""}`}
                sizes="80px"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductImageThumbnails;
