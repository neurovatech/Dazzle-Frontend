import React from "react";
import Link from "next/link";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
import Image from "next/image";
import { api } from "@/lib/api";
import BlogCard from "@/components/Blogs/BlogCard";
import BlogInformationSection from "@/components/Blogs/BlogInformationSection";
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

const infoBoxes: InfoBoxProps[] = [
  { bg: "bg-blue-50 shadow-sm" },
  { bg: "bg-purple-50 shadow-sm" },
  { bg: "bg-white border border-gray-100 shadow-sm" },
  { bg: "bg-yellow-50 shadow-sm" },
];

async function getBlogs(){
  try {
    const res = await api.get<unknown>(
      `/blogs?page=1&datalimit=3&isCareer=0`,
      { cache: "no-store" },
    );
    const obj = res as Record<string, unknown>;
    return {
      data: Array.isArray(obj?.data) ? (obj.data as BlogPost[]) : [],
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { data: []};
  }
}



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

// const LatestBlog: React.FC = () => {
async function LatestBlog() {

  const [{ data: blogPosts }] = await Promise.all([
    getBlogs(),
  ]);

  return (
    <section className="flex flex-col flex-1 max-w-355 mx-auto md:px-12.5 px-4 mt-10!">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 cursor-pointer">
        {blogPosts.map((post: BlogPost) => (
          <BlogCard key={post.uuid} post={post} />
        ))}
      </div>

<div className="">
  <BlogInformationSection />
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
