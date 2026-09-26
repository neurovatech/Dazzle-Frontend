"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import NoImg from "@/images/no_images.png";

/**
 * Tiny client island: exists only so a broken remote image URL can fall back to
 * the placeholder via onError. Everything else about the card is server-rendered.
 */
export default function ProductCardImage({
  src,
  alt,
  priority = false,
}: {
  src: string | StaticImageData;
  alt: string;
  /** Skips lazy-loading — pass true for cards above the fold. */
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? NoImg : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      // eager, NOT priority — see CategoriesCard's CategoryImage: `priority`
      // adds a high-priority preload per image, and ~35 product cards did
      // that on the homepage, starving the hero (LCP) image of bandwidth.
      loading={priority ? "eager" : "lazy"}
      // low priority for the eager ones: React adds a <link rel=preload> to the
      // <head> for every non-lazy <img> that isn't fetchpriority=low — ~30 product
      // images on the homepage, all downloading at once on slow 4G and delaying
      // the render-blocking CSS to ~2s (Lighthouse "Render-blocking requests" /
      // network tree). They must stay eager (a lazy <img> inside a Swiper slide
      // can stay unloaded — verified), but they don't need to outrank the CSS/hero.
      fetchPriority={priority ? "low" : undefined}
      className="object-contain! p-1 transition-transform duration-300"
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 280px"
      onError={() => setErrored(true)}
      quality={75}
    />
  );
}
