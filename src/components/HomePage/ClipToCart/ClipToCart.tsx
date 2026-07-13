/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CartIcon } from "@/icon";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProduct {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: {
    fileUuid: string;
    mediaFileUrl: string;
  };
  // 👇 video clip lives here, not at the top level
  clipInfo?: {
    clipThumbnail: string;
    clipUrl: string;
  };
}

interface ApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ApiProduct[];
}

interface Product {
  id: string;
  title: string;
  image: string;
  productSlug: string;
  videoUrl?: string;
  clipThumbnail?: string;
  regularPrice?: number;
  discountedPrice?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmpty = (value: string | null | undefined): boolean =>
  !value || value.trim() === "";

const formatPrice = (value?: number) =>
  typeof value === "number" ? `৳${value.toLocaleString("en-BD")}` : undefined;

// ─── Reel Modal ────────────────────────────────────────────────────────────────
function ReelModal({
  isOpen,
  initialIndex,
  products,
  onClose,
}: {
  isOpen: boolean;
  initialIndex: number;
  products: Product[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + products.length) % products.length);
  }, [products.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % products.length);
  }, [products.length]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartY.current = null;
  };

  const handleAddToCart = (id: string) => {
    setAddedIds((prev) => new Set(prev).add(id));
  };

  if (!isOpen || products.length === 0) return null;

  const product = products[currentIndex];
  const hasVideo = !isEmpty(product.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <button
        onClick={goNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      <div
        className="relative w-full max-w-[600px] mx-4 md:mx-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: "min(85vh, 720px)" }}
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
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {hasVideo && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
          {products.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
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
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/70"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
function ClipToCart({
  autoplayDelay = 3000,
  navigation = true,
  pagination = true,
}: {
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["showcase-clip-to-cart"],
    staleTime: 5 * 60 * 1000, // 5 min
    queryFn: () =>
      api.get<ApiResponse>("/showcase-items?showcaseSlug=clip-to-cart"),
  });

  const products: Product[] =
    data?.data?.map((item) => ({
      id: item.productUuid,
      title: item.productName,
      productSlug: item.productSlug,
      image: item.thumbnails?.mediaFileUrl ?? "",
      videoUrl: item.clipInfo?.clipUrl,
      clipThumbnail: item.clipInfo?.clipThumbnail,
      regularPrice: item.regularPrice,
      discountedPrice: item.discountedPrice,
    })) ?? [];

  const handleOpenModal = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center gap-6 pb-5">
          <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
            Clip to Cart
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 dark:bg-[#2e2b28] rounded-lg h-[220px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return null; // or a friendly empty state
  }

  console.log(products, "productsproductsproductsproductsproducts")

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h3>
        {/* <Link
          href="#"
          className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300"
        >
          See all
        </Link> */}
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={products.length > 5}
        pagination={pagination ? { clickable: true } : false}
        navigation={navigation}
        autoplay={
          autoplayDelay
            ? { delay: autoplayDelay, disableOnInteraction: false }
            : undefined
        }
        scrollbar={{ draggable: true }}
        slidesPerView={2}
        spaceBetween={8}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 10 },
        }}
        className="mySwiper"
      >
        {products.map((product, i) => {
          const hasVideo = !isEmpty(product.videoUrl);
          const hasDiscount =
            product.discountedPrice &&
            product.regularPrice &&
            product.discountedPrice < product.regularPrice;

          return (
            <SwiperSlide key={product.id}>
              <div
                className="group bg-white dark:bg-[#2e2b28] rounded-lg shadow-md p-4 relative transition-all duration-500 hover:shadow-2xl cursor-pointer h-full w-full flex flex-col"
                onClick={() => handleOpenModal(i)}
              >
                {/* Cart badge */}
                {/* <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#101518] dark:bg-white absolute right-3 top-3 z-10">
                  <CartIcon className="w-5 h-5 text-[#E9CCAE] dark:text-black" />
                </div> */}

                {/* Fixed-height media box → keeps every card aligned */}
                <div className="relative w-full h-75 max-[450px]:h-50 rounded-md overflow-hidden bg-gray-100 dark:bg-black/20">
                  <Image
                    src={`${product?.clipThumbnail}`}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />

                  {/* Play button — only shows if this item actually has a video */}
                  {hasVideo && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center backdrop-blur-md bg-black/30 border border-black/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Product title */}
                <p className="mt-3 text-xs font-medium text-gray-700 dark:text-white line-clamp-2 leading-tight min-h-[32px]">
                  {product.title}
                </p>

                {/* Price */}
                {(product.discountedPrice || product.regularPrice) && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#CB843B]">
                      {formatPrice(
                        product.discountedPrice ?? product.regularPrice
                      )}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <ReelModal
        isOpen={modalOpen}
        initialIndex={selectedIndex}
        products={products}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default ClipToCart;