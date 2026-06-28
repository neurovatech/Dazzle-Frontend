import type { Metadata } from "next";
import BlogCard from "@/components/Blogs/BlogCard";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import NoData from "@/components/ui/NoData";
export const metadata: Metadata = {
  title: "Latest Blogs & Technology News - Dazzle",
  description: "Stay updated with the latest technology trends, smartphone reviews, gadget comparisons, and laptop guides in Bangladesh at Dazzle.",
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

async function getBlogs(): Promise<BlogPost[]> {
  try {
    const res = await api.get<unknown>("/blogs", { cache: "no-store" });
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj?.data)) {
      return obj.data as BlogPost[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

async function BlogPage() {
  const blogPosts = await getBlogs();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "#" },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto lg:px-8 px-4">
      <Breadcrumb items={breadcrumbItems} />
      <h3 className="lg:text-[32px] text-[20px] font-bold py-3">Latest Blogs</h3>

      {blogPosts.length === 0 ? (
        <NoData message="No blogs found at the moment." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 cursor-pointer">
          {blogPosts.map((post) => (
            <BlogCard key={post.uuid} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPage;