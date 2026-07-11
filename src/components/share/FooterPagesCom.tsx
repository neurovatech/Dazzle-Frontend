"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageData {
  pageUuid: string;
  pageTitle: string;
  pageSlug: string;
  pageContent: string; // raw HTML from CMS
}

interface PageResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: PageData;
}

interface FooterPagesComProps {
  endpoint: string; // e.g. "emi_policy", "pre_order_policy", "warranty_policy"
  fallbackTitle?: string;
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] p-6 ${className}`}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

function FooterPagesCom({ endpoint, fallbackTitle = "Policy" }: FooterPagesComProps) {
  const { data, isLoading } = useQuery<PageResponse>({
    queryKey: ["page", endpoint],
    staleTime: 30 * 60 * 1000, // 30 min — policy pages don't change often
    queryFn: () => api.get<PageResponse>(`/pages/${endpoint}`),
  });

  const pageContent = data?.data?.pageContent ?? null;
  const pageTitle = data?.data?.pageTitle ?? fallbackTitle;

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <span className="text-sm text-gray-400">Loading content...</span>
        </div>
      )}

      {/* API content — render raw HTML from CMS */}
      {!isLoading && pageContent && (
        <Card>
          <article
            className="
              prose prose-sm lg:prose-base dark:prose-invert max-w-none
              text-gray-700 dark:text-white

              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
              [&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-600 [&_th]:p-3 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-700 [&_th]:text-left
              [&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-600 [&_td]:p-3 [&_td]:text-center

              [&_h1]:text-gray-900 dark:[&_h1]:!text-white
              [&_h2]:text-gray-900 dark:[&_h2]:!text-white
              [&_h3]:text-gray-800 dark:[&_h3]:!text-white
              [&_h4]:text-gray-800 dark:[&_h4]:!text-white
              [&_h5]:text-gray-800 dark:[&_h5]:!text-white
              [&_h6]:text-gray-800 dark:[&_h6]:!text-white

              [&_p]:text-gray-700 dark:[&_p]:!text-white
              [&_span]:dark:!text-white
              [&_div]:dark:!text-white

              [&_li]:text-gray-700 dark:[&_li]:!text-white
              [&_ul]:text-gray-700 dark:[&_ul]:!text-white
              [&_ol]:text-gray-700 dark:[&_ol]:!text-white
              [&_li::marker]:text-gray-500 dark:[&_li::marker]:!text-white

              [&_strong]:text-gray-900 dark:[&_strong]:!text-white
              [&_b]:text-gray-900 dark:[&_b]:!text-white
              [&_em]:text-gray-700 dark:[&_em]:!text-white
              [&_i]:text-gray-700 dark:[&_i]:!text-white

              [&_a]:text-blue-600 dark:[&_a]:!text-white dark:[&_a]:underline

              [&_blockquote]:text-gray-700 dark:[&_blockquote]:!text-white
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-500

              [&_th]:text-gray-900 dark:[&_th]:!text-white
              [&_td]:text-gray-700 dark:[&_td]:!text-white

              [&_code]:text-gray-800 dark:[&_code]:!text-white
              [&_pre]:text-gray-800 dark:[&_pre]:!text-white

              dark:[&_*]:!text-white

              overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </Card>
      )}

      {/* <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        সর্বশেষ আপডেট: এপ্রিল ২০২৬
      </p> */}
    </div>
  );
}

export default FooterPagesCom;