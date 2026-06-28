"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GALLERY_IMAGES = [
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F105005%2FIMG_2210.jpg&w=828&q=75",
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F61446%2FWhatsApp-Image-2025-09-03-at-12.59.43-PM.jpeg&w=828&q=75",
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F94555%2FIMG_0617.jpg&w=828&q=75",
  "https://dazzle.com.bd/_next/image?url=https%3A%2F%2Fdazzle.sgp1.cdn.digitaloceanspaces.com%2F94555%2FIMG_0617.jpg&w=828&q=75",
];

const ImageGallery: React.FC = () => {
  const [active, setActive] = useState(0);

  const prev = () =>
    setActive((a) => (a === 0 ? GALLERY_IMAGES.length - 1 : a - 1));
  const next = () =>
    setActive((a) => (a === GALLERY_IMAGES.length - 1 ? 0 : a + 1));

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={GALLERY_IMAGES[active]}
          alt="Branch image"
          fill
          className="object-cover transition-all duration-500"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Nav arrows */}
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
      </div>

      {/* Thumbnails */}
      {/* Thumbnails */}
      <div className="flex gap-2">
        {GALLERY_IMAGES.map((img, i) => (
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
            <Image
              src={img}
              alt={`Thumbnail ${i + 1}`}
              fill
              className="object-cover"
              sizes="25vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
