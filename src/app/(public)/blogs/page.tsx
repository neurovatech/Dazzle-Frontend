import type { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/Blogs/BlogCard";
import BlogCategoryFilter from "@/components/Blogs/BlogCategoryFilter";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import NoData from "@/components/ui/NoData";

export const metadata: Metadata = {
  title: "Latest Blogs & Technology News - Dazzle",
  description:
    "Stay updated with the latest technology trends, smartphone reviews, gadget comparisons, and laptop guides in Bangladesh at Dazzle.",
};

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

const PER_PAGE = 12;

async function getBlogs(page: number, category?: string): Promise<BlogsResponse> {
  try {
    const categoryQuery = category ? `&category=${category}` : "";
    const res = await api.get<unknown>(
      `/blogs?page=${page}&datalimit=${PER_PAGE}${categoryQuery}`,
      { cache: "no-store" },
    );
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

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

async function BlogPage({ searchParams }: BlogPageProps) {
  const { page, category } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ data: blogPosts, totalPages }, categories] = await Promise.all([
    getBlogs(currentPage, category),
    getBlogCategories(),
  ]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({
      value: c.blog_category_slug,
      label: c.blog_category,
    })),
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "#" },
  ];


  const buildPageLink = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (category) params.set("category", category);
    return `/blogs?${params.toString()}`;
  };

  console.log(categoryOptions, "categoryOptions")

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto lg:px-8 px-4">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between pb-3">
        <h3 className="lg:text-[32px] text-[20px] font-bold py-3 text-gray-900 dark:text-white">
          Latest Blogs
        </h3>

        <BlogCategoryFilter options={categoryOptions} />
      </div>

      {blogPosts.length === 0 ? (
        <NoData message="No blogs found at the moment." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 cursor-pointer">
            {blogPosts.map((post) => (
              <BlogCard key={post.uuid} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-10">
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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