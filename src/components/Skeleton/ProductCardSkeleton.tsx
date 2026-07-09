// Matches GlobalProductCard layout exactly

function ShimmerBox({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-[#2e2b28] rounded-xl ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl w-full shadow-sm overflow-hidden select-none">
      {/* Image area */}
      <div className="bg-[#E7E7E7] dark:bg-[#2a2520] lg:p-4 p-2 rounded-3xl">
        {/* Badges row */}
        <div className="flex justify-between mb-3">
          <ShimmerBox className="h-6 w-12 rounded-full" />
          <ShimmerBox className="h-6 w-20 rounded-full" />
        </div>
        {/* Product image placeholder */}
        <div className="flex justify-center items-center mb-4 h-[95px] lg:h-[126px]">
          <ShimmerBox className="w-[85px] h-[95px] lg:w-[97px] lg:h-[126px] rounded-xl" />
        </div>
        {/* Action row */}
        <div className="flex justify-end">
          <div className="flex gap-2 bg-white lg:p-3 p-2 lg:-mr-4 -mr-1.75 rounded-tl-3xl">
            <ShimmerBox className="w-6 h-6 rounded-full" />
            <ShimmerBox className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Text area */}
      <div className="p-4 space-y-2">
        <ShimmerBox className="h-4 w-4/5 rounded-lg" />
        <ShimmerBox className="h-3 w-16 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <ShimmerBox className="h-5 w-20 rounded-lg" />
          <ShimmerBox className="h-5 w-14 rounded-lg" />
        </div>
        <ShimmerBox className="h-9 w-full rounded-2xl mt-2" />
      </div>
    </div>
  );
}

interface Props {
  count?: number;
  cols?: "2" | "4";
}

export default function ProductGridSkeleton({ count = 12, cols = "4" }: Props) {
  return (
    <div className={`grid ${cols === "4" ? "md:grid-cols-4" : "md:grid-cols-2"} grid-cols-2 lg:gap-4 gap-2`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
