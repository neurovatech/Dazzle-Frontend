import BlogDetailsCom from "@/components/Blogs/BlogDetailsCom";
import Breadcrumb from "@/components/share/Breadcrumb";
import React from "react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ blogSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogSlug } = await params;
  const decodedSlug = decodeURIComponent(blogSlug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} - Tech Insights - Dazzle`,
    description: `Read about ${title} on Dazzle Blogs. Explore reviews, guides, comparisons, and the latest tech information.`,
  };
}

export default async function BlogDetails({ params }: PageProps) {
  const { blogSlug } = await params;
  const decodedSlug = decodeURIComponent(blogSlug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
    { label: title, href: `/blogs/${blogSlug}` },
  ];
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto lg:px-8 px-4">
      <Breadcrumb items={breadcrumbItems} />
      <BlogDetailsCom />
    </div>
  );
}
