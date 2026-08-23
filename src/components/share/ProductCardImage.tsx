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
}: {
  src: string | StaticImageData;
  alt: string;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? NoImg : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      className="object-contain! p-1 transition-transform duration-300"
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 280px"
      onError={() => setErrored(true)}
      quality={70}
    />
  );
}
