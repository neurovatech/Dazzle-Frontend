/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
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

interface Product {
  id: string;
  title: string;
  image: string;
  videoUrl?: string;
  price?: string;
}

const products: Product[] = [
  {
    id: "1",
    title: "Apple AirPods Pro (2nd Gen)",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    price: "৳1,00,000",
  },
  {
    id: "2",
    title: "Sony WH-1000XM5 Headphones",
    image: "./images/card_images_2.png",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    price: "৳1,00,000",
  },
  {
    id: "3",
    title: "Samsung Galaxy Buds Pro",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    price: "৳1,00,000",
  },
  {
    id: "4",
    title: "Bose QuietComfort 45",
    image: "./images/card_images_2.png",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    price: "৳1,00,000",
  },
  {
    id: "5",
    title: "JBL Tune 760NC",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    price: "$99",
  },
  {
    id: "6",
    title: "Beats Studio Pro 000",
    image: "./images/card_images_2.png",
    videoUrl: "https://www.youtube.com/embed/PHz_Y5iBLaY",
    price: "৳1,00,000",
  },

  {
    id: "7",
    title: "Sennheiser Momentum 4",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.youtube.com/shorts/PHz_Y5iBLaY?feature=share",
    price: "৳1,00,000",
  },
  {
    id: "8",
    title: "Audio-Technica ATH-M50x",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    price: "$149",
  },
  {
    id: "9",
    title: "Jabra Evolve2 85",
    image: "./images/card_images.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    price: "৳1,00,000",
  },
];

// ─── Reel Modal ────────────────────────────────────────────────────────────────
function ReelModal({
  isOpen,
  initialIndex,
  onClose,
}: {
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);

  // sync index when modal opens
  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  // restart video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  // lock body scroll
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
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % products.length);
  }, []);

  // keyboard navigation
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

  // mobile swipe
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

  if (!isOpen) return null;

  const product = products[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Desktop: Prev arrow */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      {/* Desktop: Next arrow */}
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {/* Reel card */}
      <div
        className="relative w-full max-w-[400px] mx-4 md:mx-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: "min(85vh, 720px)" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Video */}
        <video
          ref={videoRef}
          key={product.id}
          src={product.videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted={muted}
          playsInline
          poster={product.image}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top: mute button */}
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

        {/* Mobile swipe indicator dots */}
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

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Counter */}
          <p className="text-white/50 text-xs mb-1 font-medium tracking-widest uppercase">
            {currentIndex + 1} / {products.length}
          </p>

          {/* Title */}
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">
            {product.title}
          </h3>

          {/* Price */}
          {product.price && (
            <p className="text-[#CB843B] font-bold text-xl mb-4">
              {product.price}
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={() => handleAddToCart(product.id)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              addedIds.has(product.id)
                ? "bg-green-500 text-white scale-95"
                : "bg-[#CB843B] hover:bg-[#b8722e] text-white hover:scale-[1.02] active:scale-95"
            }`}
          >
            <CartIcon className="w-4 h-4" />
            {addedIds.has(product.id) ? "Added to Cart ✓" : "Add to Cart"}
          </button>
        </div>

        {/* Mobile swipe hint (first open only) */}
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

  const handleOpenModal = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#222222_0%,#965C20_43.27%,#693B0C_100%)] dark:text-white">
          Clip to Cart
        </h3>
        <Link
          href="#"
          className="md:text-[20px] text-[14px] text-gray-700 hover:text-[#CB843B] dark:text-white transition-colors duration-300"
        >
          See all
        </Link>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        loop={true}
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
        {products.map((product, i) => (
          <SwiperSlide key={product.id}>
            <div
              className="group bg-white dark:bg-[#2e2b28] rounded-lg shadow-md p-4 relative transition-all duration-500 hover:shadow-2xl cursor-pointer"
              onClick={() => handleOpenModal(i)}
            >
              {/* Cart badge */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#101518] dark:bg-white absolute right-3 top-3 z-10">
                <CartIcon className="w-5 h-5 text-[#E9CCAE] dark:text-black" />
              </div>

              {/* Thumbnail */}
              <img
                src={product.image}
                alt={product.title}
                className="w-full object-cover rounded-md"
              />

              {/* Play button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center backdrop-blur-md bg-white/30 border border-white/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              {/* Product title */}
              <p className="mt-3 text-xs font-medium text-gray-700 dark:text-white line-clamp-2 leading-tight">
                {product.title}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>


      <ReelModal
        isOpen={modalOpen}
        initialIndex={selectedIndex}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default ClipToCart;
