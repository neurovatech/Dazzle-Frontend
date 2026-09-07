"use client";

/**
 * SeoCardModal
 *
 * Renders 4 clickable SEO content cards (hseogl1–4 from site-settings).
 * Clicking a card opens a full-screen modal with the HTML content.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { SEO_RICH_TEXT_CLASS } from "@/lib/seo-content";

interface SeoCard {
  label: string;
  html:  string;
  wrapper: string;
}

interface Props {
  cards: SeoCard[];
}

const WRAPPERS = [
  "bg-white border border-gray-200",
  "bg-[#EEEEFF] border border-[#DDDDF5]",
  "bg-[#F0FAF4] border border-[#D9F0E3]",
  "bg-[#FFF6EE] border border-[#FFE8D0]",
];

/** Strip HTML tags to get plain-text preview for the card heading */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First N words of plain text */
function excerpt(html: string, words = 20): string {
  const plain = stripHtml(html);
  const parts = plain.split(" ");
  return parts.length > words
    ? parts.slice(0, words).join(" ") + "…"
    : plain;
}

export default function SeoCardModal({ cards }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (cards.length === 0) return null;

  const activeCard = openIdx !== null ? cards[openIdx] : null;

  return (
    <>
      {/* ── Card grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {cards.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIdx(i)}
            className={`rounded-2xl p-6 h-full text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-100 cursor-pointer ${card.wrapper}`}
          >
            <h2 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 line-clamp-3">
              {excerpt(card.html, 15)}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
              {excerpt(card.html, 40)}
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-[#6D3F0E] underline underline-offset-2">
              Read more →
            </span>
          </button>
        ))}
      </div>

      {/* ── Modal ── */}
      {activeCard && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpenIdx(null)}
        >
          <div
            className="relative bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">
                {excerpt(activeCard.html, 12)}
              </p>
              <button
                onClick={() => setOpenIdx(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-3 shrink-0"
                aria-label="Close"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div
                className={`dark-html-content ${SEO_RICH_TEXT_CLASS}`}
                dangerouslySetInnerHTML={{ __html: activeCard.html }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
