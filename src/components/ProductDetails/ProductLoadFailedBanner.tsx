"use client";

/**
 * Shown when the product API request itself failed (backend unreachable),
 * as opposed to the product genuinely not existing (which is a real 404 —
 * see src/app/(public)/product/[productSlug]/page.tsx). Previously this
 * case rendered a silent, zeroed-out page shell with no indication to the
 * buyer that anything had gone wrong or a way to retry.
 */
export default function ProductLoadFailedBanner() {
  return (
    <div className="max-w-350 mx-auto lg:px-4 px-2 pt-4">
      <div className="flex items-center justify-between gap-3 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 rounded-2xl p-4">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          😔 We couldn&apos;t load this product&apos;s details right now.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
