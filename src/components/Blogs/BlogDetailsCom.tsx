/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import RelatedPosts from "./RelatedPosts";

const CalendarIcon: React.FC = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface BlogDetailsComProps {
  post: any;
}

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] dark:text-white! backdrop-blur-sm p-6 ${className}`}
  >
    {children}
  </div>
);

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function BlogDetailsCom({ post }: BlogDetailsComProps) {
  const [metaDescription, articleHtml] = post.content.split("~separator~");
  const thumbnailUrl = post.thumbnail?.[0]?.media_file ?? "/placeholder-blog.webp";

  return (
    <div>
      {/* Image */}
      <div className="overflow-hidden relative w-full h-[700px] group rounded-3xl">
        <Image
          src={thumbnailUrl}
          alt={post.post_title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-3xl"
        />
      </div>

      {/* Content */}
      <div className="py-6 space-y-6">
        {/* Meta + Title Card */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-yellow-400 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
              {post.post_category}
            </span>
            <span className="text-[#222] dark:text-gray-300 text-xs flex items-center gap-1">
              <CalendarIcon />
              {formatDate(post.published_at)}
            </span>
          </div>

          <h1 className="font-semibold text-[20px] lg:text-[32px] text-[#222] dark:text-white mb-2 leading-snug">
            {post.post_title}
          </h1>

          {metaDescription?.trim() && (
            <p className="text-[#222] dark:text-gray-300 text-sm leading-relaxed">
              {metaDescription.trim()}
            </p>
          )}
        </Card>

        {/* Article body Card */}
        {articleHtml && (
          <Card>
  <article
    className="text-[#222] dark:text-white
               [&_h1]:text-[#222] [&_h1]:dark:text-white
               [&_h2]:text-[#222] [&_h2]:dark:text-white
               [&_h3]:text-[#222] [&_h3]:dark:text-white
               [&_h4]:text-[#222] [&_h4]:dark:text-white
               [&_p]:text-[#222] [&_p]:dark:text-gray-300
               [&_li]:text-[#222] [&_li]:dark:text-gray-300
               [&_span]:text-[#222] [&_span]:dark:text-gray-300!
               [&_strong]:text-[#222] [&_strong]:dark:text-white
               [&_td]:text-[#222] [&_td]:dark:text-black
               [&_a]:text-indigo-600 [&_a]:dark:text-black
               [&_table]:border [&_table]:border-gray-200 [&_table]:dark:border-[#4a443f]
               [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-[#4a443f]
               [&_td]:p-2"
    dangerouslySetInnerHTML={{ __html: articleHtml }}
  />
</Card>
        )}

        {/* Related Posts Card */}
        {/* <Card>
          <h2 className="text-[#222] dark:text-white font-bold mb-4">
            Related Posts
          </h2>
          <RelatedPosts />
        </Card> */}
      </div>
    </div>
  );
}

export default BlogDetailsCom;