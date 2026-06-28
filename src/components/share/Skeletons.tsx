import React from "react";

// 1. Flash Sale Skeleton
export function FlashSaleSkeleton() {
  return (
    <div className="bg-[#6D3F0E] md:py-10 md:mt-10! max-w-355 mx-auto md:h-165">
      <div className="md:px-12.5 px-4 pb-4 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 w-48 bg-white/20 rounded-md" />
          <div className="h-8 w-24 bg-white/20 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-white/10 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Offer Banner Skeleton
export function OfferBannerSkeleton() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4 my-6">
      <div className="h-44 w-full bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-2xl" />
    </div>
  );
}

// 3. Trending Now Skeleton
export function TrendingNowSkeleton() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto md:h-135 md:px-12.5 px-4 py-8">
      <div className="flex justify-between items-center mb-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-800 rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// 4. Clip To Cart Skeleton
export function ClipToCartSkeleton() {
  return (
    <div className="bg-[#E9CCAE] dark:bg-[#6d3f0e] py-10 mt-10! max-w-355 mx-auto md:px-12.5 px-4">
      <div className="h-60 w-full bg-black/10 dark:bg-white/10 animate-pulse rounded-2xl" />
    </div>
  );
}

// 5. Shop By Brand Skeleton
export function ShopBrandSkeleton() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto py-10 px-4 md:px-12.5">
      <div className="h-8 w-44 bg-gray-200 dark:bg-zinc-800 rounded-md mb-6 animate-pulse" />
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-zinc-900 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// 6. New Arrivals Skeleton
export function NewArrivalsSkeleton() {
  return (
    <div className="bg-[#6D3F0E] py-10 mt-10! max-w-355 mx-auto md:h-165">
      <div className="md:px-12.5 px-4 animate-pulse">
        <div className="h-10 w-48 bg-white/20 rounded-md mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-white/10 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. Most Popular Skeleton
export function MostPopularSkeleton() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4 py-10">
      <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// 8. Hot Deal Skeleton
export function HotDealSkeleton() {
  return (
    <div className="bg-[#222222] py-10 mt-10! max-w-355 mx-auto md:px-12.5 px-4">
      <div className="h-10 w-48 bg-white/20 rounded-md mb-6 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 bg-white/10 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// 9. Feature Products Skeleton
export function FeatureProductsSkeleton() {
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4 mt-10! py-10">
      <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// 10. Latest Blog Skeleton
export function LatestBlogSkeleton() {
  return (
    <div className="max-w-355 mx-auto py-10 md:px-12.5 px-4">
      <div className="h-8 w-44 bg-gray-200 dark:bg-zinc-800 rounded-md mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-60 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
