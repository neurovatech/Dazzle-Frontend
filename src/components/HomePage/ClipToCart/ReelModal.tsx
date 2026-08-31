"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import {
  isEmpty,
  formatPrice,
  REEL_ASPECT_W,
  REEL_ASPECT_H,
  type ClipProduct,
} from "./clipToCart.shared";

interface ReelModalProps {
  isOpen: boolean;
  initialIndex: number;
  products: ClipProduct[];
  onClose: () => void;
}

/** Ignore further wheel/swipe input for this long after a reel change. */
const STEP_COOLDOWN_MS = 450;

/**
 * Full-screen reel viewer.
 *
 * The reel never scrolls and never moves: the frame is a fixed 9:16 box centred
 * in the viewport, and every gesture — wheel, swipe, arrow key, arrow button —
 * is consumed to step between clips instead of scrolling anything.
 *
 * The wheel and touchmove listeners are registered non-passively on purpose: a
 * passive listener cannot call preventDefault, and without that the page behind
 * scrolls under the open modal. Setting body overflow alone does not stop
 * trackpad or touch scroll chaining, which is why overscroll-behavior is set too.
 */
export default function ReelModal({
  isOpen,
  initialIndex,
  products,
  onClose,
}: ReelModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastStepAt = useRef(0);

  // Reset to the clicked clip each time the modal opens. Adjusted during render
  // rather than in an effect so the first painted frame already shows the right
  // clip — an effect would paint the previous one for a frame first.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setCurrentIndex(initialIndex);
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const goPrev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + products.length) % products.length),
    [products.length],
  );
  const goNext = useCallback(
    () => setCurrentIndex((i) => (i + 1) % products.length),
    [products.length],
  );

  /** Step at most once per cooldown — one trackpad flick fires dozens of events. */
  const step = useCallback(
    (dir: 1 | -1) => {
      const now = Date.now();
      if (now - lastStepAt.current < STEP_COOLDOWN_MS) return;
      lastStepAt.current = now;
      if (dir === 1) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  // ── Lock the page behind, and turn scrolling into reel changes ──
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      step(e.deltaY > 0 ? 1 : -1);
    };

    // Nothing inside the modal is scrollable, so every touch drag is a swipe.
    const onTouchMove = (e: TouchEvent) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") step(1);
      else if (e.key === "Escape") onClose();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, step, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) step(diff > 0 ? 1 : -1);
    touchStartY.current = null;
  };

  if (!isOpen || products.length === 0) return null;

  const product = products[currentIndex];
  const hasVideo = !isEmpty(product.videoUrl);

  // One height drives both dimensions, so the frame is exactly 9:16 at every
  // size. All three caps matter: the viewport height, an upper bound so it does
  // not become absurd on tall desktop monitors, and — the one that is easy to
  // miss — the height implied by the available WIDTH. Without that last term a
  // narrow phone clamps the width but keeps the tall height, and the frame ends
  // up taller than 9:16 (measured 343x715 instead of 343x610), cropping more of
  // the clip than intended.
  //
  // dvh rather than vh because iOS counts the collapsing address bar in vh.
  const frameHeight = `min(88dvh, 820px, calc((100vw - 2rem) * ${REEL_ASPECT_H} / ${REEL_ASPECT_W}))`;
  const frameStyle = {
    height: frameHeight,
    width: `calc(${frameHeight} * ${REEL_ASPECT_W} / ${REEL_ASPECT_H})`,
  };

  return (
    /* z-[9999] sits above the sticky mobile footer, which is itself z-100 and,
       being rendered later in the layout, otherwise paints over the open reel. */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden overscroll-none bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Step buttons sit beside the frame on wide screens and float over it on
          narrow ones, where a 9:16 box leaves no room at the sides. */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
        aria-label="Previous clip"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
        aria-label="Next clip"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-black"
        style={frameStyle}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            key={product.id}
            src={product.videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={muted}
            playsInline
            poster={product.clipThumbnail || product.image}
          />
        ) : (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 92vw, 460px"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {hasVideo && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="relative w-[60px] h-[60px] mb-[10px] rounded-[2px] overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="60px"
              className="object-cover"
            />
          </div>
          <p className="text-white/50 text-xs mb-1 font-medium tracking-widest uppercase">
            {currentIndex + 1} / {products.length}
          </p>
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">
            {product.title}
          </h3>
          {(product.discountedPrice || product.regularPrice) && (
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#CB843B] font-bold text-xl">
                {formatPrice(product.discountedPrice ?? product.regularPrice)}
              </p>
              {product.discountedPrice &&
                product.regularPrice &&
                product.discountedPrice < product.regularPrice && (
                  <p className="text-white/50 text-sm line-through">
                    {formatPrice(product.regularPrice)}
                  </p>
                )}
            </div>
          )}
          <Link
            href={`/product/${product.productSlug}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[#CB843B] hover:bg-[#b8722e] text-white hover:scale-[1.02] active:scale-95"
          >
            See Details
          </Link>
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"
            aria-label="Previous clip"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"
            aria-label="Next clip"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
