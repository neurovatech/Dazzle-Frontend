import React from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import BlogCard from "@/components/Blogs/BlogCard";
import BlogInformationSection from "@/components/Blogs/BlogInformationSection";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { hasRichText, splitSeoSections } from "@/lib/seo-content";
import SeoCardModal from "@/components/ProductDetails/SeoCardModal";
interface BlogPost {
  id: number;
  image: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
}

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

interface InfoBoxProps {
  bg: string;
}

const WRAPPERS = [
  "bg-blue-50 dark:bg-blue-950/30 shadow-sm",
  "bg-purple-50 dark:bg-purple-950/30 shadow-sm",
  "bg-white dark:bg-[#2e2b28] border border-gray-100 dark:border-gray-700/60 shadow-sm",
  "bg-yellow-50 dark:bg-yellow-950/30 shadow-sm",
] as const;

async function getBlogs() {
  try {
    const res = await api.get<unknown>(`/blogs?page=1&datalimit=3&isCareer=0`, {
      next: { revalidate: 5 },
    });
    const obj = res as Record<string, unknown>;
    return {
      data: Array.isArray(obj?.data) ? (obj.data as BlogPost[]) : [],
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { data: [] };
  }
}

// const LatestBlog: React.FC = () => {
async function LatestBlog() {
  const [{ data: blogPosts }, settings] = await Promise.all([
    getBlogs(),
    getSiteSettings(),
  ]);

  // Build SEO cards from hseogl1–4.
  //
  // The CMS currently has all four fields saved with the exact same 160KB
  // blob (a content-entry mistake — the frontend can't otherwise tell that
  // apart from 4 genuinely distinct fields), so de-duping identical blobs
  // first is what stops that showing as 4 literally-identical cards. Once
  // someone gives hseogl2/3/4 their own real text, they naturally start
  // showing as their own additional cards again — nothing here assumes 4.
  //
  // Each surviving blob is then split on its own `<h1>`/`<h2>` headings —
  // hseogl1 today is one blob covering several different topics ("Best
  // Smartphone Shop", "Best Tablet and iPad Shop", ...) concatenated one
  // after another under separate headings, not a single subject the whole
  // field is about. Splitting recovers the one-card-per-topic layout the
  // content already has baked into its structure, instead of one giant
  // wall of text.
  const seenHtml = new Set<string>();
  const uniqueBlobs = [
    settings.hseogl1,
    settings.hseogl2,
    settings.hseogl3,
    settings.hseogl4,
  ]
    .filter((html): html is string => hasRichText(html))
    .filter((html) => {
      if (seenHtml.has(html)) return false;
      seenHtml.add(html);
      return true;
    });

  const seoCards = uniqueBlobs
    .flatMap((html) => splitSeoSections(html))
    .map((section, i) => ({
      label:   section.title || `Info ${i + 1}`,
      html:    section.html,
      wrapper: WRAPPERS[i % WRAPPERS.length],
    }));

  return (
    <section className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4  mt-10!">
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="lg:text-[32px] text-[16px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Latest Blog
        </h3>
        <Link
          href="/blogs"
          className="text-sm font-medium text-primary  bg-orange-50 border-orange-200 px-4 py-2 rounded-[10px] dark:text-[#2e2b28]  hover:underline hover:text-[#CB843B]! transition-colors duration-300 "
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {blogPosts.map((post: BlogPost, index: number) => (
          <div
            key={post.uuid}
            className={
              index === 0
                ? "block cursor-pointer"
                : "hidden sm:block cursor-pointer"
            }
          >
            <BlogCard post={post} />
          </div>
        ))}
      </div>

      <div className="">
        <BlogInformationSection />
      </div>

      {/* SEO content cards — hseogl1–4 from site-settings, click to open modal */}
      {seoCards.length > 0 && (
        <SeoCardModal cards={seoCards} />
      )}
    </section>
  );
}

export default LatestBlog;
