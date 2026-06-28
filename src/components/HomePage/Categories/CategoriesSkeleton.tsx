import React from "react";

export default function CategoriesSkeleton() {
  return (
    <div className="md:px-12.5 px-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        {/* Title placeholder */}
        <div className="h-8 w-36 bg-gray-200 dark:bg-zinc-800 rounded-md" />
        {/* "See all" link placeholder */}
        <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md" />
      </div>

      {/* Grid Skeleton (8 Columns on desktop, 4 on mobile) */}
      <div className="py-4">
        <div className="grid gap-4 md:grid-cols-8 grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center items-center">
              {/* Image container placeholder */}
              <div className="w-[100px] h-[100px] bg-gray-200/60 dark:bg-zinc-800/40 rounded-4xl flex items-center justify-center">
                {/* Inner icon placeholder */}
                <div className="w-12 h-12 bg-gray-300/40 dark:bg-zinc-700/30 rounded-full" />
              </div>
              {/* Title label placeholder */}
              <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
