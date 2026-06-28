/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import ProductImageThumbnails from "./ProductImageThumbnails";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  badges?: React.ReactNode;
  selected?: number;
  onSelect?: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  badges,
  selected: externalSelected,
  onSelect,
}) => {
  const [internalSelected, setInternalSelected] = useState(0);
  const selected = externalSelected ?? internalSelected;

  const handleSelect = (i: number) => {
    setInternalSelected(i);
    onSelect?.(i);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white  dark:bg-[#3e3329]  dark:border-gray-700/60 transition-colors duration-200">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        {badges && (
          <div className="absolute top-3 z-10 flex flex-col gap-1.5 w-full justify-between">
            {badges}
          </div>
        )}
        {/* <img
          src={images[selected]}
          alt={`Product image ${selected + 1}`}
          className="w-4/5 h-4/5 object-contain transition-all duration-300"
        /> */}
        <div className="relative w-4/5 h-4/5">
          <Image
            src={images[selected]}
            alt={`Product image ${selected + 1}`}
            fill
            className="object-contain transition-all duration-300"
            sizes="(max-width: 768px) 80vw, 40vw"
          />
        </div>
      </div>
      {/* Thumbnails */}
      <ProductImageThumbnails
        images={images}
        selected={selected}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ProductImageGallery;
