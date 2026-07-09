"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NoImg from "@/images/no_images.png";

interface ImageGalleryProps {
  images?: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const galleryImages = images?.length ? images : [NoImg.src];
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? galleryImages.length - 1 : a - 1));
  const next = () => setActive((a) => (a === galleryImages.length - 1 ? 0 : a + 1));

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={galleryImages[active]}
          alt="Branch image"
          className="w-full h-full object-cover transition-all duration-500"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
        />
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-1 h-22 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === active
                  ? "border-amber-700 scale-105"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = NoImg.src; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
