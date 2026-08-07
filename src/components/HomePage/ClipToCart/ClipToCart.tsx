/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import Image from "next/image";
import { Play, X, ChevronUp, ChevronDown, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { CartIcon } from "@/icon";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Swiper as SwiperType } from "swiper";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  brandName?: string;
  brandLogo?: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { fileUuid: string; mediaFileUrl: string };
  clipInfo?: { clipThumbnail: string; clipUrl: string };
}

interface ApiResponse {
  statusCode: number; status: string; found: boolean;
  count: number; totalCount: number; page: number;
  limit: number; totalPages: number; data: ApiProduct[];
}

interface Product {
  id: string;
  title: string;
  image: string;
  productSlug: string;
  brandName?: string;
  brandLogo?: string;
  videoUrl?: string;
  clipThumbnail?: string;
  regularPrice?: number;
  discountedPrice?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmpty = (v: string | null | undefined) => !v || v.trim() === "";
const formatPrice = (v?: number) =>
  typeof v === "number" ? `৳${v.toLocaleString("en-BD")}` : undefined;

// ─── Reel Modal ───────────────────────────────────────────────────────────────

function ReelModal({ isOpen, initialIndex, products, onClose }: {
  isOpen: boolean; initialIndex: number; products: Product[]; onClose: () => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
        <X className="w-5 h-5" />
      </button>
      <button onClick={goPrev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110">
        <ChevronUp className="w-6 h-6" />
      </button>
      <button onClick={goNext} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110">
        <ChevronDown className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-150 mx-4 md:mx-0 rounded-2xl overflow-hidden shadow-2xl" style={{ height: "min(85vh, 720px)" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {hasVideo ? (
          <video ref={videoRef} key={product.id} src={product.videoUrl} className="w-full h-full object-cover" autoPlay loop muted={muted} playsInline poster={product.clipThumbnail || product.image} />
        ) : (
          <Image src={product.image} alt={product.title} fill sizes="100vw" className="object-cover" priority />
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
  product: Product; index: number; onOpenModal: (i: number) => void;
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
      className="group bg-[#f4e3d3] dark:bg-[#3a332b]  p-1.5 sm:p-2 relative transition-all duration-500 hover:shadow-2xl cursor-pointer h-full w-full flex flex-col"
      onClick={() => onOpenModal(index)}
    >
      {/* Media box */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-t-2xl overflow-hidden bg-gray-100 dark:bg-black/20 shrink-0">
        <Image
          src={!isEmpty(product.clipThumbnail) ? product.clipThumbnail! : product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover"
          unoptimized
        />

        {/* Play button */}
        {hasVideo && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center backdrop-blur-md bg-black/30 border border-black/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Product thumbnail circle — overlaps bottom edge */}
        
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#2e2b28] rounded-b-lg mt-[-1px] pt-8 px-3 pb-3 flex flex-col flex-1 text-left relative">

        {product.image && (
          <div className="absolute  left-1/2 -translate-x-1/2 top-[-40px] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#2e2b28] shadow-md border-4 border-white dark:border-[#2e2b28] z-10 overflow-hidden">
            <Image src={product.image} alt={product.title} fill sizes="64px" className="object-cover" unoptimized />
          </div>
        )}

        {/* Brand row */}
        {product.brandName && (
          <div className="flex items-center gap-1 mb-1">
            {product.brandLogo ? (
              <div className="relative w-4 h-4 shrink-0">
                <Image src={product.brandLogo} alt={product.brandName} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <span className="text-xs">🏷</span>
            )}
            <span className="text-xs text-gray-500 font-medium">{product.brandName}</span>
          </div>
        )}

        {/* Title */}
        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight h-10 sm:h-12">
          {product.title}
        </p>

        {/* Price + Cart */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {(product.discountedPrice || product.regularPrice) ? (
            <div className="flex items-end gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(product.discountedPrice ?? product.regularPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">Price on request</span>
          )}

          <button
            onClick={handleCartClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 active:scale-95
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

function ClipToCart({ autoplayDelay = 3000, navigation = true, pagination = true }: {
  autoplayDelay?: number; navigation?: boolean; pagination?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["showcase-clip-to-cart"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => api.get<ApiResponse>("/showcase-items?showcaseSlug=clip-to-cart"),
  });

  const products: Product[] = data?.data?.map((item) => ({
    id: item.productUuid,
    title: item.productName,
    productSlug: item.productSlug,
    brandName: item.brandName,
    brandLogo: item.brandLogo,
    image: item.thumbnails?.mediaFileUrl ?? "",
    videoUrl: item.clipInfo?.clipUrl,
    clipThumbnail: item.clipInfo?.clipThumbnail,
    regularPrice: item.regularPrice,
    discountedPrice: item.discountedPrice,
  })) ?? [];

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center gap-6 pb-5">
          <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
            Clip to Cart
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-2xl h-[340px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div>
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h3>
      </div>

      <div className="relative">
        {navigation && (
          <button onClick={() => swiperRef.current?.slidePrev()} className="absolute left-[-10px] top-[45%] -translate-y-1/2 -translate-x-2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-[#D4A97A] hover:text-white transition-colors" aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          loop={products.length > 5}
          pagination={pagination ? { clickable: true } : false}
          autoplay={autoplayDelay ? { delay: autoplayDelay, disableOnInteraction: false } : undefined}
          scrollbar={{ draggable: true }}
          slidesPerView={2}
          spaceBetween={8}
          onSwiper={(s) => { swiperRef.current = s; }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 10 },
          }}
          className="mySwiper"
        >
          {products.map((product, i) => (
            <SwiperSlide key={product.id}>
              <ClipToCartCard product={product} index={i} onOpenModal={(idx) => { setSelectedIndex(idx); setModalOpen(true); }} />
            </SwiperSlide>
          ))}
        </Swiper>

        {navigation && (
          <button onClick={() => swiperRef.current?.slideNext()} className="absolute right-[-10px] top-[45%] -translate-y-1/2 translate-x-2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-[#D4A97A] hover:text-white transition-colors" aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <ReelModal isOpen={modalOpen} initialIndex={selectedIndex} products={products} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default ClipToCart;
