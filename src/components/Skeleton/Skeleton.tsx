// components/Skeleton/Skeleton.tsx
"use client";
import React from "react";

type SkeletonConfig = {
  type: "banner" | "card" | "list" | "text" | "table" | "grid";
  count?: number; // কতটা item দেখাবে
  hasImage?: boolean; // image আছে কিনা
  hasTitle?: boolean; // title আছে কিনা
  hasContent?: boolean; // content/description আছে কিনা
  columns?: number; // grid/table এর জন্য
  aspectRatio?: "banner" | "square" | "portrait" | "landscape";
  peek?: boolean; // banner এর পাশে আরেকটা দেখাবে কিনা
  paginationDots?: boolean;
};

// Data shape দেখে config অটো-detect করে
function inferConfig(data: unknown[]): SkeletonConfig {
  if (!data || data.length === 0) return { type: "list", count: 3 };

  const sample = data[0] as Record<string, unknown>;
  const keys = Object.keys(sample);

  const hasImage = keys.some((k) =>
    ["imageUrl", "image", "img", "thumbnail", "photo", "banner"].includes(k),
  );
  const hasTitle = keys.some((k) =>
    ["title", "name", "heading", "label"].includes(k),
  );
  const hasContent = keys.some((k) =>
    ["content", "description", "text", "body", "subtitle"].includes(k),
  );

  // Banner-type detect
  const isBanner =
    hasImage &&
    keys.some(
      (k) =>
        ["banner", "slide", "hero"].includes(k.toLowerCase()) ||
        sample[k]?.toString().includes("banner"),
    );

  if (isBanner || (hasImage && hasTitle && hasContent)) {
    return {
      type: "banner",
      count: data.length,
      hasImage,
      hasTitle,
      hasContent,
      aspectRatio: "banner",
      peek: true,
      paginationDots: true,
    };
  }

  if (hasImage && hasTitle) {
    return {
      type: "grid",
      count: data.length,
      hasImage,
      hasTitle,
      hasContent,
      columns: 3,
      aspectRatio: "square",
    };
  }

  return {
    type: "list",
    count: data.length,
    hasImage,
    hasTitle,
    hasContent,
  };
}

// ─── Individual Skeleton Shapes ───────────────────────────────

function ShimmerBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-[#393430] rounded-[15px] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      {children}
    </div>
  );
}

function BannerSkeleton({ config }: { config: SkeletonConfig }) {
  return (
    <div className="w-full pb-4 md:pb-6 pl-4">
      {/* Marquee bar */}
      <div className="w-full h-8 mb-4 rounded-md bg-gray-200 dark:bg-[#393430] animate-pulse" />

      {/* Slides */}
      <div className="flex gap-4 overflow-hidden">
        <ShimmerBlock className="shrink-0 w-[calc(65%-1rem)] md:w-[calc(66.666%-0.75rem)] h-55 sm:h-75 md:h-121.25">
          {config.hasTitle && (
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              {/* <div className="h-4 w-2/5 rounded bg-gray-300/70 dark:bg-[#555]" /> */}
              {/* {config.hasContent && (
                <div className="h-3 w-3/5 rounded bg-gray-300/70 dark:bg-[#555]" />
              )} */}
            </div>
          )}
        </ShimmerBlock>

        {config.peek && (
          <ShimmerBlock className=" md:block flex-shrink-0 w-[calc(33.333%-0.75rem)] h-55 sm:h-75 md:h-121.25" />
        )}
      </div>

      {/* Pagination dots */}
      {config.paginationDots && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: Math.min(config.count ?? 4, 6) }).map(
            (_, i) => (
              <div
                key={i}
                className={`rounded-full bg-gray-300 dark:bg-[#555] animate-pulse ${
                  i === 0 ? "w-5 h-2" : "w-2 h-2"
                }`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function CardSkeleton({ config }: { config: SkeletonConfig }) {
  const cols = config.columns ?? 3;
  const colClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${colClass[cols] ?? "grid-cols-3"} gap-4 p-4`}>
      {Array.from({ length: config.count ?? 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          {config.hasImage && (
            <ShimmerBlock
              className={`w-full ${
                config.aspectRatio === "square"
                  ? "aspect-square"
                  : config.aspectRatio === "portrait"
                    ? "aspect-[3/4]"
                    : "aspect-video"
              }`}
            />
          )}
          {config.hasTitle && (
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-[#555] animate-pulse" />
          )}
          {config.hasContent && (
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-[#555] animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ config }: { config: SkeletonConfig }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: config.count ?? 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {config.hasImage && (
            <ShimmerBlock className="w-12 h-12 flex-shrink-0 rounded-lg" />
          )}
          <div className="flex-1 space-y-2">
            {config.hasTitle && (
              <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-[#555] animate-pulse" />
            )}
            {config.hasContent && (
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-[#555] animate-pulse" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GlobalSkeletonProps {
  data: unknown[];
  forceType?: SkeletonConfig["type"];
  overrides?: Partial<SkeletonConfig>;
}

export function GlobalSkeleton({
  data,
  forceType,
  overrides,
}: GlobalSkeletonProps) {
  const config: SkeletonConfig = {
    ...inferConfig(data),
    ...(forceType ? { type: forceType } : {}),
    ...overrides,
  };

  switch (config.type) {
    case "banner":
      return <BannerSkeleton config={config} />;
    case "grid":
    case "card":
      return <CardSkeleton config={config} />;
    case "list":
    default:
      return <ListSkeleton config={config} />;
  }
}
