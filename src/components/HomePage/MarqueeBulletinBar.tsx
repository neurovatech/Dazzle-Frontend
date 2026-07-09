"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  newsUUID: string;
  title: string;
  linkUrl: string;
  openNewTab: boolean;
}

interface NewsScrollResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: NewsItem[];
}

// ─── Fallback static items (shown while loading or on error) ──────────────────

const FALLBACK_ITEMS: NewsItem[] = [
  { newsUUID: "1", title: "🎉 Welcome to Dazzle Commerce",                    linkUrl: "/",                openNewTab: false },
  { newsUUID: "2", title: "🔥 Mega Sale – Up to 70% OFF on Selected Products", linkUrl: "/offer",           openNewTab: false },
  { newsUUID: "3", title: "🚚 Free Delivery on Orders Above ৳999",             linkUrl: "/delivery-policy", openNewTab: false },
  { newsUUID: "4", title: "📱 Download the Dazzle Mobile App Today",           linkUrl: "/",                openNewTab: false },
  { newsUUID: "5", title: "💳 Secure Payment with bKash, Nagad & Cards",       linkUrl: "/",                openNewTab: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarqueeBulletinBar() {
  const { data: res } = useQuery<NewsScrollResponse>({
    queryKey: ["newsScroll"],
    queryFn: () => api.get<NewsScrollResponse>("news-scroll"),
    staleTime: 10 * 60 * 1000, // 10 min
  });

  const items: NewsItem[] = res?.found && res.data?.length ? res.data : FALLBACK_ITEMS;
  const repeated = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden select-none mb-2 py-3">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-24 bg-linear-to-r from-light_bg to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-24 bg-linear-to-l from-light_bg to-transparent" />

      <div className="flex items-center marquee-track">
        {repeated.map((item, idx) => (
          <Link
            key={`${item.newsUUID}-${idx}`}
            href={item.linkUrl || "#"} 
            target={item.openNewTab ? "_blank" : "_self"}
            rel={item.openNewTab ? "noopener noreferrer" : undefined}
            className="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 group whitespace-nowrap shrink-0 cursor-pointer justify-center border-r border-[#E7E7E7] dark:border-white/10"
          >
            <span className="text-primary dark:text-white font-medium text-xs sm:text-sm group-hover:font-bold tracking-wide transition-all">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
