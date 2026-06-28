"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Post {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  href: string;
}

const posts: Post[] = [
  {
    id: 1,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
  {
    id: 2,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
  {
    id: 3,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
  {
    id: 4,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
  {
    id: 5,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
  {
    id: 6,
    title: "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
    category: "Technology",
    date: "20 December,2025",
    image: "",
    href: "#",
  },
];

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <a
      href={post.href}
      className="flex items-start gap-3 group hover:opacity-90 transition-opacity duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=160&q=80"
          alt={post.title}
          fill
          className="object-cover"
          sizes="80px"
          // Fallback for missing images in demo
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=160&q=80";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Category badge */}
        <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-800 text-amber-50">
          {post.category}
        </span>

        {/* Date */}
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
          </svg>
          <span>{post.date}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors duration-150">
          {post.title}
        </h3>
      </div>
    </a>
  );
};

const RelatedPosts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section className=" py-6">
      {/* Section heading */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Related Post
      </h2>

      {/* Search input */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-full outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 transition-all duration-150 placeholder:text-gray-400"
        />
      </div>

      {/* Posts grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-300 text-center py-8">
          No posts found for &quot;{searchQuery}&quot;.
        </p>
      )}
    </section>
  );
};

export default RelatedPosts;
