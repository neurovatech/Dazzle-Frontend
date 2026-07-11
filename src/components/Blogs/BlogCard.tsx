import Image from "next/image";
import Link from "next/link";
import NoImg from "@/images/no_images.png";
import { CalendarIcon } from "lucide-react";

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

const ArrowIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#facc15"
    strokeWidth="2.5"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const imgSrc = post.thumbnail?.[0]?.media_file
    ? post.thumbnail?.[0]?.media_file
    : NoImg;

  const dateStr = new Date(post.published_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  

  return (
    <div className="group flex flex-col h-full rounded-xl overflow-hidden border border-gray-100 dark:border-[#1b1b1b] shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-[#1b1b1b] duration-300">
  <div className="overflow-hidden relative w-full h-44">
    <Image
      src={imgSrc}
      alt={post.post_title}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
  </div>

  <div className="p-4 flex flex-col flex-1">
    <div className="flex items-center gap-3 mb-2">
      <span className="bg-[#d4a97a] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
        {post.post_category}
      </span>

      <span className="text-gray-400 dark:text-gray-300 text-xs flex items-center gap-1">
        <CalendarIcon size={16} />
        {dateStr}
      </span>
    </div>

    <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 min-h-[44px]">
      {post.post_title}
    </h3>

    <p className="text-gray-500 dark:text-gray-300 text-xs leading-relaxed line-clamp-2 min-h-[36px] mt-2">
      {post.post_caption}
    </p>

    <Link
      href={`/blogs/${post.post_slug}`}
      className="mt-auto w-full flex items-center justify-between bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gray-700 dark:bg-[#2e2b28] transition-colors"
    >
      Read More

      <span className="w-6 h-6 rounded-full border border-yellow-400 flex items-center justify-center">
        <ArrowIcon />
      </span>
    </Link>
  </div>
</div>
  );
};
export default BlogCard;