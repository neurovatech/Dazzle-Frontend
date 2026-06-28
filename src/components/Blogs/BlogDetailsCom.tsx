import React from "react";
import Image from "next/image";
import RelatedPosts from "./RelatedPosts";

interface BlogPost {
  id: number;
  image: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
}
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

function BlogDetailsCom() {
  const post = {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
    category: "Technology",
    date: "20 December, 2025",
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    excerpt:
      "Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the ..Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the .Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the . Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the . Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the . Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the . Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the . Order the all-new iPhone 17 Series now at the best price in Bangladesh! Experience unmatched performance and innovation, designed to elevate every moment of your life. Get your device from the .",
  };
  return (
    <div className="">
      {/* Image */}
      <div className="overflow-hidden relative w-full h-[500px] group rounded-3xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-3xl"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-yellow-400 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <CalendarIcon />
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[20px] lg:text-[32px] text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 dark:text-gray-300 text-xs mb-4 leading-relaxed">
          {post.excerpt}
        </p>
        <p className="text-gray-500 dark:text-gray-300 text-xs mb-4 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="">
          <RelatedPosts />
        </div>

        {/* Button */}
        {/* <Link href={`/blogs/${post.category}`}
        className="w-full flex items-center justify-between bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Read More
        <span className="w-6 h-6 rounded-full border border-yellow-400 flex items-center justify-center">
          <ArrowIcon />
        </span>
      </Link> */}
      </div>
    </div>
  );
}

export default BlogDetailsCom;
