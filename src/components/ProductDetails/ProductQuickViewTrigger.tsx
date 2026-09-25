"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

/**
 * The Quick View modal (~900 lines: variants, gallery helpers, cart/wishlist
 * logic, react-hot-toast…) used to be imported straight into every product
 * card, so its whole dependency tree shipped in the homepage's JavaScript and
 * was evaluated on load — Lighthouse listed a ~160 KB chunk of it as 100%
 * unused, on a page that already has 1.2s of Total Blocking Time.
 *
 * This renders only the eye button up front (same markup and classes as the
 * modal's own trigger, so nothing looks different) and pulls the modal in on
 * demand — starting the download on hover/touch/focus so it is normally ready
 * by the time the click lands.
 */
const loadQuickView = () => import("./ProductQuicView");
const LazyQuickView = dynamic(loadQuickView, { ssr: false });

interface Props {
  slug?: string;
  productUuid?: string;
  title?: string;
  price?: number;
  image?: string;
  isTba?: boolean;
  showTbaFlag?: boolean;
}

export default function ProductQuickViewTrigger(props: Props) {
  const [requested, setRequested] = useState(false);

  return (
    <div>
      <button
        onClick={() => setRequested(true)}
        onPointerEnter={loadQuickView}
        onFocus={loadQuickView}
        onTouchStart={loadQuickView}
        aria-label="Quick view"
        className="lg:w-11 lg:h-11 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {requested && <LazyQuickView {...props} defaultOpen hideTrigger />}
    </div>
  );
}
