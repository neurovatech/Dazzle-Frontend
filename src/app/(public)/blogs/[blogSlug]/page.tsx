import BlogDetailsCom from "@/components/Blogs/BlogDetailsCom";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ blogSlug: string }>;
}

export interface BlogDetail {
  uuid: string;
  post_title: string;
  post_slug: string;
  post_caption: string;
  post_category: string;
  category_slug: string;
  is_featured: boolean;
  posted_by: string;
  published_at: string;
  content: string;
  thumbnail: { uuid: string; media_file: string }[];
}

async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const res = await api.get<unknown>(`/blogs/${slug}`, { next: { revalidate: 5 } });
    const obj = res as Record<string, unknown>;
    if (obj?.data && typeof obj.data === "object") {
      return obj.data as BlogDetail;
    }
    return null;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogSlug } = await params;
  const blog = await getBlogBySlug(decodeURIComponent(blogSlug));

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  const [metaDescription] = blog.content.split("~separator~");

  return {
    title: `${blog.post_title}`,
    description: metaDescription?.trim() || blog.post_caption || undefined,
  };
}

export default async function BlogDetails({ params }: PageProps) {
  const { blogSlug } = await params;
  const decodedSlug = decodeURIComponent(blogSlug);
  const blog = await getBlogBySlug(decodedSlug);

  if (!blog) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
    { label: blog.post_title, href: `/blogs/${blogSlug}` },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto lg:px-8 px-4">
      <Breadcrumb items={breadcrumbItems} />
      <BlogDetailsCom post={blog} />
    </div>
  );
}