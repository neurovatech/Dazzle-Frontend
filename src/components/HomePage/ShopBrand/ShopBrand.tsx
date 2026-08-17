"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/share/GlobalProductCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import NoImg from "@/images/no_images.png";

export interface Brand {
  id: string;
  label: string;
  logo: string;
  slug: string;
  is_active: boolean;
}

interface ProductItem {
  productUuid: string;
  productCode?: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: { mediaFileUrl: string } | null;
}

interface ProductListResponse {
  data: ProductItem[];
  totalCount: number;
}

interface Props {
  brands: Brand[];
}

export default function ShopBrand({ brands }: Props) {
  // First brand default active
  const [activeBrandSlug, setActiveBrandSlug] = useState<string>(
    brands[0]?.slug ?? "",
  );

  // Fetch products for active brand
  const { data: productRes, isLoading } = useQuery<ProductListResponse>({
    queryKey: ["brand-products", activeBrandSlug],
    queryFn: () =>
      api.get<ProductListResponse>(
        `/products?brandSlug=${activeBrandSlug}&limit=12&page=1`,
        { cache: "no-store" },
      ),
    enabled: !!activeBrandSlug,
  });

  // Safely extract products array
  const products: ProductItem[] = Array.isArray(productRes?.data)
    ? productRes.data
    : Array.isArray(productRes)
      ? (productRes as unknown as ProductItem[])
      : [];

  const activeBrand =
    brands.find((b) => b.slug === activeBrandSlug) || brands[0];

  return (
    <div className="md:px-12.5 px-4">
      {/* ── Outer Container ── */}
      <div className="bg-[#FFFBF7] dark:bg-[#1a1816] rounded-3xl px-4 dark:border-zinc-800 py-6">
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="md:text-[32px] text-[20px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
            Shop by Brand
          </h3>
          <Link
            href="/brands"
            className="text-sm font-medium text-[#101518] dark:text-gray-300 hover:text-[#CB843B] transition-colors"
          >
            See all
          </Link>
        </div>

        {/* ── Brand Slider / Grid ── */}
        <div className="mb-6">
          <Swiper
            slidesPerView={4}
            spaceBetween={10}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 2, spaceBetween: 14 },
              768: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 8, spaceBetween: 16 },
            }}
          >
            {brands.map((brand) => {
              const isActive = activeBrandSlug === brand.slug;
              return (
                <SwiperSlide key={brand.id}>
                  <button
                    type="button"
                    onClick={() => setActiveBrandSlug(brand.slug)}
                    className="w-full flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
                  >
                    <div
                      className={`
                        w-full aspect-square rounded-[28px] transition-all duration-300
                        flex items-center justify-center p-3 sm:p-4
                        ${
                          isActive
                            ? "bg-[#FFF4E8] border border-[#E9CCAE] shadow-sm dark:bg-[#342a20] dark:border-[#B57908]"
                            : "bg-[#F3F3F5] border border-transparent dark:bg-zinc-800/80 hover:bg-[#F0ECF8]"
                        }
                      `}
                    >
                      <div className="relative w-full aspect-square p-3 md:p-8 transition-all duration-300 hover:scale-105">
                        <Image
                          src={brand.logo || NoImg}
                          alt={brand.label}
                          fill
                          sizes="(max-width: 768px) 25vw, 20vw"
                          className=" object-contain transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              NoImg.src;
                          }}
                        />
                      </div>
                    </div>

                    {/* Brand Label */}
                    <span
                      className={`text-[11px] lg:text-xs font-semibold text-center leading-tight transition-colors ${
                        isActive
                          ? "text-[#101518] dark:text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {brand.label}
                    </span>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* ── Active Brand Products ── */}
        {activeBrandSlug && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse aspect-[3/4]"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-white/50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {activeBrand?.label
                    ? `No products found for ${activeBrand.label}`
                    : "No products found"}
                </p>
              </div>
            ) : (
              <Swiper
                key={activeBrandSlug}
                slidesPerView={2}
                spaceBetween={10}
                breakpoints={{
                  480: { slidesPerView: 2, spaceBetween: 12 },
                  640: { slidesPerView: 3, spaceBetween: 12 },
                  768: { slidesPerView: 4, spaceBetween: 14 },
                  1024: { slidesPerView: 5, spaceBetween: 14 },
                  1280: { slidesPerView: 5, spaceBetween: 14 },
                }}
              >
                {products.map((product, idx) => (
                  <SwiperSlide key={product.productUuid ?? idx}>
                    <ProductCard
                      productUuid={product.productUuid}
                      slug={product.productSlug}
                      title={product.productName}
                      price={product.discountedPrice}
                      originalPrice={product.regularPrice}
                      discount={Math.round(product.disRate)}
                      badge={product.productBadge}
                      isBestDeal={product.disRate > 15}
                      inStock={!product.isTba}
                      image={product.thumbnails?.mediaFileUrl ?? ""}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
