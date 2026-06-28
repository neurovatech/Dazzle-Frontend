"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageGallery from "@/components/shop/ImageGallery";
import ReviewCard from "@/components/shop/ReviewCard";
import { LOCATIONS, REVIEWS, BLOG_POSTS } from "@/components/shop/data";
import {
  MapPin,
  Phone,
  Mail,
  Map,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Breadcrumb from "@/components/share/Breadcrumb";

// Use first location as demo detail
const LOCATION = LOCATIONS[0];
const REVIEWS_PER_PAGE = 6;

const LocationDetailPage: React.FC = () => {
  const [reviewPage, setReviewPage] = useState(0);

  const totalPages = Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE);

  const visibleReviews = REVIEWS.slice(
    reviewPage * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE,
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop-location" },
    { label: `${LOCATION.name} (${LOCATION.branch}) `, href: "/shop-location" },
  ];

  return (
    <div className="bg-white dark:bg-[#121212] transition-colors duration-300">
      {/* ── Breadcrumb ── */}
      <div className="max-w-355 mx-auto">
        <div className="md:px-12.5">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Hero: Gallery + Info ── */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#121212]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Gallery */}
          <ImageGallery />

          <div>
            {/* View Map Button */}
            <button
              className="self-start flex items-center gap-1.5 border border-[#6D3F0E] bg-white/90 dark:bg-[#1F1F1F]/90 backdrop-blur-sm text-[#000000] dark:text-white font-medium px-3 py-2 rounded-[27px] shadow-[0px_4px_9.5px_1px_#6D3F0E6E] hover:bg-white dark:hover:bg-[#2A2A2A] transition-colors"
              aria-label="View on map"
            >
              <Map size={16} className="text-[#6D3F0E]" />
              View Map
            </button>

            {/* Title */}
            <div className="mt-2.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {LOCATION.name}{" "}
                <span className="dark:text-gray-300">
                  ({LOCATION.branch})
                </span>
              </h1>

              <p className="text-[#6D3F0E] dark:text-[#D89B5C] font-medium mt-2.5">
                {LOCATION.address}
              </p>
            </div>

            {/* Info */}
            <div className="flex justify-between gap-6 items-center mt-6 w-2/5">
              <div>
                <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">
                  Day Off
                </p>

                <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                  {LOCATION.dayOff}
                </p>
              </div>

              <div>
                <p className="text-sm uppercase text-[#747474] dark:text-gray-400 mb-0.5">
                  Contact
                </p>

                <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                  {LOCATION.contact}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              Dazzle is a name synonymous with excellence, innovation, and trust
              in the world of technology and gadgets. Over the past years, we
              have proudly built a legacy rooted in exceptional customer
              satisfaction and unmatched quality.
            </p>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
              With a growing family of 312,000+ unique customers, we have earned
              the trust of tech enthusiasts across the nation. From smartphones
              to laptops, smartwatches to accessories, we have successfully
              delivered over 820,000+ products, turning dreams into reality.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#5c3a1e] dark:bg-[#1A1A1A]">
        <div>
          <h2 className="text-white text-xl font-bold mb-6">
            Customer Review
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                disabled={reviewPage === 0}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center disabled:opacity-30 transition"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    i === reviewPage
                      ? "bg-amber-300 scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Reviews page ${i + 1}`}
                />
              ))}

              <button
                onClick={() =>
                  setReviewPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={reviewPage === totalPages - 1}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center disabled:opacity-30 transition"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#121212]">
        <div>
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
        </div>
      </section>
    </div>
  );
};

export default LocationDetailPage;