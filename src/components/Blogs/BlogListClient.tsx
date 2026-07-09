"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "./BlogCard";
import BlogGridSkeleton from "@/components/Skeleton/BlogCardSkeleton";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  uuid: string;
  post_title: string;
  post_slug: string;
  post_caption: string;
  post_category: string;
  category_slug: string;
  published_at: string;
  thumbnail: { uuid: string; media_file: string }[];
}

interface BlogsApiResponse {
  statusCode: number;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: BlogPost[];
}

const PER_PAGE = 12;

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)}
            className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
              p === page
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >{p}</button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogListClient() {
  const searchParams = useSearchParams();
  const categoryUuid = searchParams.get("category") ?? undefined;
  const currentPage  = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const updatePage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page"); else params.set("page", String(p));
    window.history.pushState(null, "", `/blogs?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data, isLoading, isPlaceholderData } = useQuery<BlogsApiResponse>({
    queryKey:        ["blogs", categoryUuid, currentPage],
    staleTime:       2 * 60 * 1000,
    placeholderData: (prev) => prev,
    queryFn: () => {
      const qp = new URLSearchParams({ page: String(currentPage), limit: String(PER_PAGE) });
      if (categoryUuid) qp.set("blog_cat_uuid", categoryUuid);
      return api.get<BlogsApiResponse>(`/blogs?${qp.toString()}`);
    },
  });

  const posts      = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <h3 className="lg:text-[32px] text-[20px] font-bold text-gray-900 dark:text-white">
          Latest Blogs
        </h3>
        {!isLoading && totalCount > 0 && (
          <p className="text-sm text-gray-400">{totalCount.toLocaleString()} posts</p>
        )}
      </div>

      {/* ── First load: full skeleton grid ── */}
      {isLoading && <BlogGridSkeleton count={PER_PAGE} />}

      {/* ── Filter/page change: skeleton over dimmed old cards ── */}
      {!isLoading && (
        <div className="relative">
          {isPlaceholderData && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <BlogGridSkeleton count={PER_PAGE} />
            </div>
          )}
          <div className={`transition-opacity duration-150 ${isPlaceholderData ? "opacity-30" : "opacity-100"}`}>

            {/* Empty */}
            {posts.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No blogs found for this category.
              </div>
            )}

            {/* Grid */}
            {posts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {posts.map((post) => (
                  <BlogCard key={post.uuid} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && (
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={updatePage} />
      )}
    </div>
  );
}
