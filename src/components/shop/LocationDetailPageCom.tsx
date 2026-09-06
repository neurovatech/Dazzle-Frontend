"use client";

import React, { useState } from "react";
import { Map, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import ImageGallery from "@/components/shop/ImageGallery";
import ReviewCard from "@/components/shop/ReviewCard";
import { REVIEWS, BLOG_POSTS } from "@/components/shop/data";
import Breadcrumb from "@/components/share/Breadcrumb";
import GlobalModal from "@/components/share/GlobalModal";
import type { StoreDetail } from "@/app/(public)/shop-location/[slug]/page";

const REVIEWS_PER_PAGE = 6;

interface Props {
  store: StoreDetail;
}

const LocationDetailPageCom: React.FC<Props> = ({ store }) => {
  const [reviewPage, setReviewPage] = useState(0);
  const [mapOpen, setMapOpen]       = useState(false);

  const totalReviewPages = Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE);
  const visibleReviews   = REVIEWS.slice(
    reviewPage * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE,
  );

  const [descMain, descLink] = (store.description || "").split("~seperator~");
  const galleryImages = store.thumbnail?.length
    ? store.thumbnail.map((t) => t.mediaFileURL)
    : store.thumbnail_img
    ? [store.thumbnail_img]
    : [];

  // ── Map embed URL ──
  const hasCoords = !!(store.latitude && store.longitude);
  const googleMapEmbedUrl = hasCoords
    ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`
    : store.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(store.address)}&z=15&output=embed`
    : null;

  const breadcrumbItems = [
    { label: "Home",  href: "/" },
    { label: "Shop",  href: "/shop-location" },
    { label: store.branch_name, href: `/shop-location/${store.slug}` },
  ];

  return (
    <div className="bg-white dark:bg-[#121212] transition-colors duration-300">
      {/* ── Breadcrumb ── */}
      <div className="max-w-355 mx-auto">
        <div className="md:px-12.5">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#121212]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Gallery — real images from API */}
          <ImageGallery images={galleryImages} />

          <div>
            <button
              onClick={() => setMapOpen(true)}
              className="self-start flex items-center gap-1.5 border border-[#6D3F0E] bg-white/90 dark:bg-[#1F1F1F]/90 backdrop-blur-sm text-[#000000] dark:text-white font-medium px-3 py-2 rounded-[27px] shadow-[0px_4px_9.5px_1px_#6D3F0E6E] hover:bg-white dark:hover:bg-[#2A2A2A] transition-colors"
              aria-label="View on map"
            >
              <Map size={16} className="text-[#6D3F0E]" />
              View Map
            </button>

            <div className="mt-2.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                {store.branch_name}
              </h1>
              <p className="text-[#6D3F0E] dark:text-[#D89B5C] font-medium mt-2.5">
                {store.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 w-full max-w-xs">
              <div>
                <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">Day Off</p>
                <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                  {store.dayoff || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">Contact</p>
                <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                  {store.contactno || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">Open Day</p>
                <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                  {store.openday || "—"}
                </p>
              </div>
              {store.email && (
                <div>
                  <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">Email</p>
                  <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C] break-all text-sm">
                    {store.email}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {descMain?.trim() && (
              <div
                className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed text-sm prose dark:prose-invert max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: descMain.trim() }}
              />
            )}
            {descLink?.trim() && (
              <a
                href={descLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-[#6D3F0E] dark:text-[#D89B5C] hover:underline break-all"
              >
                {descLink.trim()}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#5c3a1e] dark:bg-[#1A1A1A] hidden">
        <div>
          <h2 className="text-white text-xl font-bold mb-6">Customer Review</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {totalReviewPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                disabled={reviewPage === 0}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalReviewPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    i === reviewPage ? "bg-amber-300 scale-125" : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
              <button
                onClick={() => setReviewPage((p) => Math.min(totalReviewPages - 1, p + 1))}
                disabled={reviewPage === totalReviewPages - 1}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog Posts ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#121212] hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className={`${post.color} dark:bg-[#1F1F1F] rounded-2xl p-6 border border-gray-100 dark:border-[#2E2E2E] hover:shadow-sm transition-shadow duration-200 cursor-pointer group`}
            >
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-3 group-hover:text-amber-800 dark:group-hover:text-[#D89B5C] transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Map Modal — same pattern as LocationCard ── */}
      <GlobalModal
        title={store.branch_name}
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
      >
        <div className="flex flex-col w-full">
          {/* Modal sub-header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EEEEEE] dark:border-[#2E2E2E]">
            <MapPin size={18} className="text-[#6D3F0E] shrink-0" />
            <div>
              <p className="font-semibold text-[#222222] dark:text-white text-sm leading-tight">
                {store.branch_name}
              </p>
              {store.address && (
                <p className="text-xs text-[#747474] dark:text-gray-400 mt-0.5">
                  {store.address}
                </p>
              )}
            </div>
          </div>

          {/* Map iframe or fallback */}
          <div className="w-full h-[400px] bg-gray-100 dark:bg-[#2A2A2A]">
            {googleMapEmbedUrl ? (
              <iframe
                src={googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${store.branch_name}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <MapPin size={40} className="text-gray-300 dark:text-gray-600" />
                <p className="text-[#747474] dark:text-gray-400 font-medium">
                  No location data available
                </p>
              </div>
            )}
          </div>

          {/* Coordinates row */}
          {hasCoords && (
            <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 dark:bg-[#1B1B1B] border-t border-[#EEEEEE] dark:border-[#2E2E2E] text-xs text-[#747474] dark:text-gray-400">
              <span>
                <span className="font-medium text-[#222222] dark:text-white">Lat:</span>{" "}
                {store.latitude}
              </span>
              <span>
                <span className="font-medium text-[#222222] dark:text-white">Lng:</span>{" "}
                {store.longitude}
              </span>
            </div>
          )}
        </div>
      </GlobalModal>
    </div>
  );
};

export default LocationDetailPageCom;
