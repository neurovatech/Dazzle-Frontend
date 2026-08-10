/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ProductImageThumbnails from "./ProductImageThumbnails";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const selected = externalSelected ?? internalSelected;

  // external selected change হলে internal sync করো
  useEffect(() => {
    if (externalSelected !== undefined) {
      setInternalSelected(externalSelected);
    }
  }, [externalSelected]);

  const handleSelect = (i: number) => {
    setInternalSelected(i);
    onSelect?.(i);
  };

  // Main image click → lightbox open
  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, lightboxPrev, lightboxNext]);

  const handleLightboxThumbClick = (i: number) => {
    setLightboxIndex(i);
    handleSelect(i);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#3e3329] dark:border-gray-700/60 transition-colors duration-200">
        {/* ── Main Image ── */}
        <div
          className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center cursor-zoom-in group"
          onClick={() => openLightbox(selected)}
        >
          {/* {badges && (
            <div className="absolute top-6 z-10 left-6 flex flex-col gap-1.5 justify-start bg-[#ff7575] text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              {badges} %
            </div>
          )} */}

          {/* Image */}
          <div className="relative w-full h-full">
            <Image
              src={images[selected]}
              alt={`Product image ${selected + 1}`}
              fill
              className="object-contain transition-all duration-300 mt-[10px]"
              // sizes="(max-width: 768px) 80vw, 40vw"
              priority
            />
          </div>

          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 z-10 rounded-2xl flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-black/50 rounded-full p-2 shadow">
              <ZoomIn size={20} className="text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>

        {/* ── Thumbnails ── */}
        <ProductImageThumbnails
          images={images}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-10000 bg-black/90 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm z-[10000] pointer-events-none">
            {lightboxIndex + 1} / {images.length}
          </p>

          {/* Main lightbox image — stopPropagation so clicking image doesn't close */}
          <div
            className="relative w-[90vw] h-[75vh] max-w-3xl z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`Product image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Prev / Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-[10000]"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-[10000]"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Lightbox thumbnails strip */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1 z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => handleLightboxThumbClick(i)}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white/10 ${
                    lightboxIndex === i
                      ? "border-orange-400 shadow-md"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`Thumb ${i + 1}`}
                      fill
                      className="object-contain p-0.5"
                      sizes="56px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
