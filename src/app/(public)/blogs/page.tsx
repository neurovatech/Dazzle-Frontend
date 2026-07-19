/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/Blogs/BlogCard";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import NoData from "@/components/ui/NoData";

export const metadata: Metadata = {
  title: "Latest Blogs & Technology News - Dazzle",
  description:
    "Stay updated with the latest technology trends, smartphone reviews, gadget comparisons, and laptop guides in Bangladesh at Dazzle.",
};

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

interface BlogsResponse {
  data: BlogPost[];
  totalCount: number;
  page: number;
  totalPages: number;
}

interface BlogCategory {
  uuid: string;
  blog_category: string;
  blog_category_slug: string;
  thumbnail_img: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PER_PAGE = 12;

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getBlogs(page: number, categoryUuid?: string): Promise<BlogsResponse> {
  try {
    // Build query — only add blog_cat_uuid when a category is selected
    const qp = new URLSearchParams({
      page: String(page),
      datalimit: String(PER_PAGE),
    });
    if (categoryUuid) qp.set("blog_cat_uuid", categoryUuid);

    const res = await api.get<unknown>(`/blogs?${qp.toString()}&isCareer=0`, { cache: "no-store" });
    const obj = res as Record<string, unknown>;

    return {
      data: Array.isArray(obj?.data) ? (obj.data as BlogPost[]) : [],
      totalCount: typeof obj?.totalCount === "number" ? (obj.totalCount as number) : 0,
      page: typeof obj?.page === "number" ? (obj.page as number) : page,
      totalPages: typeof obj?.totalPages === "number" ? (obj.totalPages as number) : 1,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { data: [], totalCount: 0, page, totalPages: 1 };
  }
}

async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const res = await api.get<unknown>("/blog-categories", { cache: "no-store" });
    const obj = res as Record<string, unknown>;
    return Array.isArray(obj?.data) ? (obj.data as BlogCategory[]) : [];
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

async function BlogPage({ searchParams }: BlogPageProps) {
  const { page, category } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const currentCategory = category ?? "all";

  // category in URL = uuid of the blog category
  const [{ data: blogPosts, totalPages, totalCount }, categories] = await Promise.all([
    getBlogs(currentPage, category),
    getBlogCategories(),
  ]);

  const categoryOptions:any = [
    { value: "all", label: "All Categories", blog_category_slug:"all", },
    ...categories.map((c) => ({
      value: c.uuid,
      label: c.blog_category,
      blog_category_slug: c.blog_category_slug,
    })),
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
  ];

  const buildPageLink = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (category) params.set("category", category);
    return `/blogs?${params.toString()}`;
  };

  const buildCategoryLink = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("category", value);
    params.set("page", "1");
    return `/blogs?${params.toString()}`;
  };

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto lg:px-8 px-4">
      <Breadcrumb items={breadcrumbItems} />

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option:any) => {
          const isActive = currentCategory === option.blog_category_slug;
          return (
            <Link
              key={option.value}
              href={buildCategoryLink(option.blog_category_slug)}
              className={`px-5! h-10 flex items-center rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? "bg-[#101828] text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <h3 className="lg:text-[32px] text-[20px] font-bold text-gray-900 dark:text-white">
          Latest Blogs
        </h3>
        {totalCount > 0 && (
          <p className="text-sm text-gray-400">{totalCount.toLocaleString()} posts</p>
        )}
      </div>

      {/* Posts grid */}
      {blogPosts.length === 0 ? (
        <NoData message="No blogs found at the moment." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 cursor-pointer">
            {blogPosts.map((post) => (
              <BlogCard key={post.uuid} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              <Link
                href={buildPageLink(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={`px-3 py-1.5 rounded-md border text-sm border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 ${
                  currentPage <= 1
                    ? "opacity-40 pointer-events-none"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Prev
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // show max 5 pages around current
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => (
                  <div key={idx}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span key={`gap-${p}`} className="px-1 text-gray-400 text-sm">
                        …
                      </span>
                    )}
                    <Link
                      key={p}
                      href={buildPageLink(p)}
                      className={`px-3 py-1.5 rounded-md border text-sm ${
                        p === currentPage
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                          : "border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {p}
                    </Link>
                  </div>
                ))}

              <Link
                href={buildPageLink(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 rounded-md border text-sm border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 ${
                  currentPage >= totalPages
                    ? "opacity-40 pointer-events-none"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlogPage;