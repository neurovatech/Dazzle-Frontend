import React from "react";
import Link from "next/link";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
import Image from "next/image";

interface BlogPost {
  id: number;
  image: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
}

interface InfoBoxProps {
  bg: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
    category: "Technology",
    date: "20 December, 2025",
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Ac molestie odio libero dignissim gravida adipiscing et adipiscing.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
    category: "Technology",
    date: "20 December, 2025",
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Ac molestie odio libero dignissim gravida adipiscing et adipiscing.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
    category: "Technology",
    date: "20 December, 2025",
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    excerpt:
      "Lorem ipsum dolor sit amet consectetur. Ac molestie odio libero dignissim gravida adipiscing et adipiscing.",
  },
];

const infoBoxes: InfoBoxProps[] = [
  { bg: "bg-blue-50" },
  { bg: "bg-purple-50" },
  { bg: "bg-white border border-gray-100 shadow-sm" },
  { bg: "bg-yellow-50" },
];

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

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <div className="group rounded-3xl overflow-hidden border border-[#F2F2F2] dark:border-gray-400 px-5.5 py-5 bg-background">
    <div className="overflow-hidden rounded-[18px] relative h-44">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-[18px]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>

    {/* Content */}
    <div className="pt-4">
      {/* Meta */}
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-[#FFE16926] text-[#E8BA00] text-sm font-regular px-2.5 py-0.5 rounded-full">
          {post.category}
        </span>
        <span className="text-[#747474] dark:text-gray-300 text-sm flex items-center gap-1">
          <CalendarIcon />
          {post.date}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#000000] dark:text-white mb-3 leading-snug line-clamp-2">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-[#747474] dark:text-gray-300 text-sm mb-10 leading-relaxed line-clamp-2">
        {post.excerpt}
      </p>

      {/* Button */}

      <Link
        href={`/blogs/${post.category}`}
        className="w-full flex items-center justify-between bg-[#222222] text-white text-sm px-4 py-2.5 rounded-[14px] transition-colors"
      >
        Read More
        <span className="w-6 h-6 rounded-full border border-[#FACC15] bg-[#3a3a3a] flex items-center justify-center">
          <ArrowAngleRightIcon />
        </span>
      </Link>
    </div>
  </div>
);

const InfoBox: React.FC<InfoBoxProps> = ({ bg }) => (
  <div className={`${bg} rounded-2xl p-6`}>
    <h4 className="font-bold text-gray-900 text-base mb-2 leading-snug">
      Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for
      Cutting-Edge Devices in Bangladesh
    </h4>
    <p className="text-gray-500 text-sm leading-relaxed">
      Looking for the best Apple products, the top smartphones, and the latest
      and greatest in the world of gadgets? Look no further than Dazzle Mobile &
      Gadget Shop – your ultimate tech haven in Bangladesh.
    </p>
  </div>
);

const LatestBlog: React.FC = () => {
  return (
    <section className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4 mt-10!">
      <div className="flex justify-between items-center gap-6 pb-5">
        <h3 className="lg:text-[32px] text-[16px] font-bold transition-colors text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white">
          Latest Blog
        </h3>
        <Link
          href="/blogs"
          className="text-sm font-medium text-primary hover:underline dark:text-white"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 cursor-pointer">
        {blogPosts.map((post: BlogPost) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-pointer">
        {infoBoxes.map((box: InfoBoxProps, i: number) => (
          <InfoBox key={i} bg={box.bg} />
        ))}
      </div>
    </section>
  );
};

export default LatestBlog;
