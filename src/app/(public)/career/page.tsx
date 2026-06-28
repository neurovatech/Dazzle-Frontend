import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import CareerSlider, { Job } from "@/components/career/CareerSlider";

export const metadata: Metadata = {
  title: "Careers & Job Openings - Dazzle",
  description: "Join the Dazzle team! Explore job openings, career paths, and opportunities in tech, admin, design, and operations at Dazzle Bangladesh.",
};

const jobs: Job[] = [
  {
    id: 1,
    category: "TECHNOLOGY",
    date: "23 Feb, 2026",
    title: "Video Editor",
    slug: "video-editor",
    description:
      "We are looking for a Junior Video Editor to create and edit videos for our tech products.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "TECHNOLOGY",
    date: "23 Feb, 2026",
    title: "Graphics Designer",
    slug: "graphics-designer",
    description:
      "We are seeking a creative Junior Graphics Designer to produce engaging visuals for our tech products.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    category: "TECHNOLOGY",
    date: "23 Feb, 2026",
    title: "Stock Auditor",
    slug: "stock-auditor",
    description: "Dhaka & Chattogram (Field-based) Vacancy : 2",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    category: "TECHNOLOGY",
    date: "23 Feb, 2026",
    title: "Stock Auditor",
    slug: "stock-auditor",
    description: "Dhaka & Chattogram (Field-based) Vacancy : 2",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=800&auto=format&fit=crop",
  },
];

export default function CareerPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Career", href: "/career" },
  ];

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#2E2B28] font-sans p-5 pb-20 max-w-355 mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-[32px] font-bold text-[#101518] dark:text-white mb-4">
        Latest Job Posts
      </h1>
      <CareerSlider jobs={jobs} />
    </div>
  );
}
