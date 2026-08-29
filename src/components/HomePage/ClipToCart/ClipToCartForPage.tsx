/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import Image from "next/image";
import { Play, X, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { CartIcon } from "@/icon";
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import {
  clipEndpoint,
  mapClipProduct,
  type ClipApiResponse,
  type ClipProduct,
} from "./clipToCart.shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

export type { ClipProduct } from "./clipToCart.shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmpty = (v: string | null | undefined) => !v || v.trim() === "";
const formatPrice = (v?: number) =>
  typeof v === "number" ? `৳${v.toLocaleString("en-BD")}` : undefined;

// ─── Reel Modal ───────────────────────────────────────────────────────────────

function ReelModal({ isOpen, initialIndex, products, onClose }: {
  isOpen: boolean; initialIndex: number; products: ClipProduct[]; onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => { if (isOpen) setCurrentIndex(initialIndex); }, [isOpen, initialIndex]);
  useEffect(() => {
    if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(() => {}); }
  }, [currentIndex]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const goPrev = useCallback(() => setCurrentIndex((i) => (i - 1 + products.length) % products.length), [products.length]);
  const goNext = useCallback(() => setCurrentIndex((i) => (i + 1) % products.length), [products.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, goPrev, goNext, onClose]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    touchStartY.current = null;
  };

  if (!isOpen || products.length === 0) return null;
  const product = products[currentIndex];
  const hasVideo = !isEmpty(product.videoUrl);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
        <X className="w-5 h-5" />
      </button>
      <button onClick={goPrev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110">
        <ChevronUp className="w-6 h-6" />
      </button>
      <button onClick={goNext} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110">
        <ChevronDown className="w-6 h-6" />
      </button>

      <div
        className="relative w-full max-w-150 mx-4 md:mx-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: "min(85vh, 720px)" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasVideo ? (
          <video ref={videoRef} key={product.id} src={product.videoUrl} className="w-full h-full object-cover" autoPlay loop muted={muted} playsInline poster={product.clipThumbnail || product.image} />
        ) : (
          // No `priority` here: this section sits far below the fold, so preloading
          // it competed for bandwidth with the real LCP (the hero banner) and
          // delayed it. `sizes` reflects the actual card width, not the viewport.
          <Image src={product.image} alt={product.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {hasVideo && (
          <button onClick={() => setMuted((m) => !m)} className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
          {products.map((_, i) => (
            <span key={i} className={`block rounded-full transition-all duration-300 ${i === currentIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="relative w-[60px] h-[60px] mb-[10px] rounded-[2px] overflow-hidden">
            <Image src={product.image} alt={product.title} fill sizes="60px" className="object-cover" />
          </div>
          <p className="text-white/50 text-xs mb-1 font-medium tracking-widest uppercase">{currentIndex + 1} / {products.length}</p>
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">{product.title}</h3>
          {(product.discountedPrice || product.regularPrice) && (
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#CB843B] font-bold text-xl">{formatPrice(product.discountedPrice ?? product.regularPrice)}</p>
              {product.discountedPrice && product.regularPrice && product.discountedPrice < product.regularPrice && (
                <p className="text-white/50 text-sm line-through">{formatPrice(product.regularPrice)}</p>
              )}
            </div>
          )}
          <Link href={`/product/${product.productSlug}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[#CB843B] hover:bg-[#b8722e] text-white hover:scale-[1.02] active:scale-95">
            See Details
          </Link>
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:hidden">
          <button onClick={goPrev} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"><ChevronUp className="w-4 h-4" /></button>
          <button onClick={goNext} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ClipToCartCard({ product, index, onOpenModal }: {
  product: ClipProduct; index: number; onOpenModal: (i: number) => void;
}) {
  const dispatch  = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isAdded   = cartItems.some((item) => item.id === product.id);

  const hasVideo    = !isEmpty(product.videoUrl);
  const hasDiscount = product.discountedPrice && product.regularPrice && product.discountedPrice < product.regularPrice;

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;
    dispatch(addToCart({
      id: product.id,
      name: product.title,
      brand: product.brandName || "",
      image: product.image || "",
      price: product.discountedPrice ?? product.regularPrice ?? 0,
      originalPrice: product.regularPrice ?? 0,
      quantity: 1,
      inStock: true,
      slug: product.productSlug || "",
    }));
    toast.success(`${product.title} added to cart! 🛒`);
  };

  return (
    <div
  className={`
    group cursor-pointer h-full w-full flex flex-col transition-all duration-500 hover:shadow-2xl
    bg-[#EDD9C4] rounded-2xl overflow-hidden
    lg:bg-[#f4e3d3] lg:dark:bg-[#3a332b] lg:rounded-2xl lg:p-2 lg:overflow-visible
  `}
  onClick={() => onOpenModal(index)}
>
  {/* ── Image section wrapper (overflow-visible so the circle avatar isn't clipped) ── */}
  <div className="relative w-full shrink-0 aspect-[4/5] lg:aspect-auto lg:h-56 xl:h-64">

    {/* Inner box handles the actual image clipping/rounding */}
    <div className="absolute inset-0 overflow-hidden bg-gray-100 dark:bg-black/20 lg:rounded-t-2xl">
      <Image
        src={!isEmpty(product.clipThumbnail) ? product.clipThumbnail! : product.image}
        alt={product.title}
        fill
        sizes="(max-width: 1024px) 80vw, 20vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Play button */}
      {hasVideo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-md bg-black/30 border border-black/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      )}
    </div>

    {/* Circle avatar — now OUTSIDE the overflow-hidden box, and z-30 so nothing covers it */}
    {product.image && (
      <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-[#2e2b28] border-4 border-white dark:border-[#2e2b28] shadow-md overflow-hidden z-30">
        <Image src={product.image} alt={product.title} fill sizes="64px" className="object-contain p-1" />
      </div>
    )}
  </div>

  {/* ── Content ── */}
  <div className="
    bg-white dark:bg-[#2e2b28] flex flex-col flex-1 text-left relative
    pt-10 px-3 pb-3
    lg:rounded-b-lg lg:mt-[-1px] lg:pt-8
  ">
    {/* Desktop ONLY — thumbnail circle at top of content */}
    {product.image && (
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-[-40px] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#2e2b28] shadow-md border-4 border-white dark:border-[#2e2b28] z-10 overflow-hidden">
        <Image src={product.image} alt={product.title} fill sizes="64px" className="object-cover" />
      </div>
    )}

    {/* Brand row */}
    {product.brandName && (
      <div className="flex items-center gap-1 mb-1">
        {product.brandLogo ? (
          <div className="relative w-4 h-4 shrink-0">
            <Image src={product.brandLogo} alt={product.brandName} fill sizes="16px" className="object-contain" />
          </div>
        ) : (
          <span className="text-xs">🏷</span>
        )}
        <span className="text-xs text-gray-500 font-medium">{product.brandName}</span>
      </div>
    )}

    {/* Title */}
    <p className="text-sm font-bold line-clamp-2 leading-tight text-[#CB843B] lg:text-gray-900 lg:dark:text-white lg:text-base h-12">
      {product.title}
    </p>

    {/* Price + Cart */}
    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
      {(product.discountedPrice || product.regularPrice) ? (
        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-1.5 lg:flex-wrap">
          <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(product.discountedPrice ?? product.regularPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs lg:text-sm text-gray-400 line-through">
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>
      ) : (
        <span className="text-xs text-gray-400">0</span>
      )}

      <button
        onClick={handleCartClick}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 active:scale-95
          ${isAdded ? "bg-green-500" : "bg-[#101518] dark:bg-white"}`}
        aria-label={isAdded ? "Added to cart" : "Add to cart"}
      >
        {isAdded ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <CartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E9CCAE] dark:text-black" />
        )}
      </button>
    </div>
  </div>
</div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ClipToCartForPageProps {
  /** First page, already fetched and mapped on the server. */
  initialProducts: ClipProduct[];
  /** Total pages reported by the API for the current page size. */
  totalPages: number;
}

function ClipToCartForPage({
  initialProducts,
  totalPages,
}: ClipToCartForPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  // Page 1 arrives from the server, so the grid is populated on first paint and
  // this only ever fetches pages 2+. A sentinel below the grid triggers the next
  // page as it comes into view; loading stops once the API runs out of pages.
  const [products, setProducts] = useState<ClipProduct[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalPages > 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Synchronous companion to isLoadingMore. The observer can fire twice in the
  // same frame — faster than a state update propagates — which sent two
  // requests for the same page. A ref flips immediately, so the second call
  // returns before it can fetch.
  const loadingRef = useRef(false);

  // Server data wins whenever it changes (revalidation, navigation back here).
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(totalPages > 1);
  }, [initialProducts, totalPages]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    const nextPage = page + 1;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const res = await api.get<ClipApiResponse>(clipEndpoint(nextPage));
      const mapped = (res?.data ?? []).map(mapClipProduct);

      if (mapped.length === 0) {
        setHasMore(false);
      } else {
        // Guard against duplicates: a product added to the showcase between two
        // requests shifts everything down a slot, which can repeat an item.
        setProducts((prev) => {
          const seen = new Set(prev.map((x) => x.id));
          return [...prev, ...mapped.filter((x) => !seen.has(x.id))];
        });
        setPage(nextPage);
        setHasMore(nextPage < (res?.totalPages ?? nextPage));
      }
    } catch (err) {
      // A failed page shouldn't wipe what's already on screen — stop paging and
      // leave the loaded clips in place.
      console.error("[ClipToCart] failed to load page", nextPage, err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, page]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      // Start fetching a little before the sentinel is actually visible, so the
      // next row is usually ready by the time the user reaches it.
      { rootMargin: "300px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!products.length) {
    return (
      <div className="py-16 text-center">
        <h1 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No clips are available right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header — h1 because this is the page's own subject; the shared header
          carries no heading, so without it the page had none at all. */}
      <div className="flex justify-between items-center gap-6 pb-5">
        <h1 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h1>
      </div>

      {/*
        Responsive grid, not a carousel.
        This is the dedicated listing page, so every clip should be reachable by
        scrolling rather than hidden behind slider paging — and a grid keeps the
        whole set in the server-rendered HTML.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <ClipToCartCard
            key={product.id}
            product={product}
            index={i}
            onOpenModal={(idx) => {
              setSelectedIndex(idx);
              setModalOpen(true);
            }}
          />
        ))}

        {/* Placeholders sized like a card, so the grid doesn't jump while the
            next page is in flight. */}
        {isLoadingMore &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-2xl h-[350px]"
            />
          ))}
      </div>

      {/* Sentinel — observed to trigger the next page. */}
      {hasMore && <div ref={sentinelRef} className="h-10 w-full" aria-hidden />}

      <div className="pb-10" />

      <ReelModal
        isOpen={modalOpen}
        initialIndex={selectedIndex}
        products={products}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default ClipToCartForPage;