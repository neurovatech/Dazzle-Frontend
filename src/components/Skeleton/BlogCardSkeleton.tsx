// Matches BlogCard layout exactly

function ShimmerBox({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-[#2e2b28] rounded-xl ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-[#1b1b1b] bg-white dark:bg-[#1b1b1b]">
      {/* Thumbnail */}
      <ShimmerBox className="w-full h-44 rounded-none" />

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Category + date row */}
        <div className="flex items-center gap-3">
          <ShimmerBox className="h-5 w-20 rounded-full" />
          <ShimmerBox className="h-4 w-24 rounded-lg" />
        </div>
        {/* Title */}
        <ShimmerBox className="h-4 w-full rounded-lg" />
        <ShimmerBox className="h-4 w-4/5 rounded-lg" />
        {/* Caption */}
        <ShimmerBox className="h-3 w-full rounded-lg" />
        <ShimmerBox className="h-3 w-2/3 rounded-lg" />
        {/* Button */}
        <ShimmerBox className="h-9 w-full rounded-lg mt-1" />
      </div>
    </div>
  );
}

export default function BlogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
