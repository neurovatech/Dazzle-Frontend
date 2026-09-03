"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toGalleryImages, type GalleryImage } from "./utils";

interface ProductImageThumbnailsProps {
  images: (string | GalleryImage)[];
  selected: number;
  onSelect: (index: number) => void;
}

/** How far one arrow-button click moves the strip. */
const STEP_PX = 200;

/**
 * Single-row thumbnail slider.
 *
 * Used to wrap onto a second row once there were more thumbnails than fit one
 * line (11 images on a busy product wrapped to two rows, pushing the price/
 * stock text further down the card). Now it never wraps — it scrolls
 * horizontally instead, like the lightbox's own thumbnail strip further down
 * this same component tree.
 *
 * On a touchscreen that horizontal scroll is reachable by swiping, so nothing
 * else was needed there. On desktop it was not: the scrollbar is hidden (by
 * design, for a clean slider look), there were no arrow buttons, and a plain
 * mouse wheel scrolls the PAGE vertically by default rather than this strip
 * horizontally — a mouse-only user had no way at all to reach thumbnails past
 * the edge of the strip. Fixed with both a wheel-to-horizontal converter and
 * visible prev/next buttons.
 */
const ProductImageThumbnails: React.FC<ProductImageThumbnailsProps> = ({
  images,
  selected,
  onSelect,
}) => {
  const items = toGalleryImages(images);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Keep the selected thumbnail in view even when the selection changes from
  // elsewhere on the page (picking a colour swatch, not just clicking a
  // thumbnail) — scoped to this strip so it never scrolls the page itself.
  //
  // `behavior: "instant"`, not "smooth" — measured directly: with CSS
  // scroll-snap active on this container, a smooth scrollIntoView call here
  // silently did nothing (scrollLeft never moved), while the identical call
  // with "instant" worked every time. Same unreliable-smooth-scroll issue as
  // the checkout scroll-restoration code elsewhere in this app; instant is
  // the one that is actually guaranteed to land.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "instant",
      inline: "nearest",
      block: "nearest",
    });
  }, [selected]);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    // -1 slack for sub-pixel rounding, which otherwise leaves the right arrow
    // visible forever at exactly the end of the scroll range.
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  // Recompute on scroll, on resize (a wider viewport can make the strip fit
  // entirely, or vice versa), and once the thumbnails themselves are laid out.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();

    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, items.length]);

  // A plain mouse wheel only ever produces vertical delta, which by default
  // scrolls the PAGE (this strip has no vertical overflow of its own) rather
  // than the strip itself. Registered as a native, non-passive listener —
  // React attaches `onWheel` as passive by default, and a passive listener
  // cannot call preventDefault(), so the page would keep scrolling underneath
  // every attempt to redirect the gesture here.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // A trackpad's own native horizontal swipe (deltaX) is left alone —
      // only a vertical-only wheel gesture gets redirected.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (!el.scrollWidth || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scrollByStep = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * STEP_PX, behavior: "instant" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-5 lg:pb-0"
      >
        {items.map((item, i) => {
          const isDisabled = item.disabled === true;
          const isActive = selected === i;

          return (
            <button
              key={`${item.url}-${i}`}
              ref={isActive ? activeRef : undefined}
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
              className={`shrink-0 snap-start w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-50 flex items-center justify-center ${
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

      {/* Arrow buttons — desktop only (md+). On touch, swiping the strip
          directly already works; the buttons exist for the plain-mouse case
          that has no other way to reach thumbnails past the visible edge. */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label="Scroll thumbnails left"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label="Scroll thumbnails right"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default ProductImageThumbnails;
