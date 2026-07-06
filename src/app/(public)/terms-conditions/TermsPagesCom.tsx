"use client";
import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function TermsPagesCom() {
  const { data: siteSettings, isLoading } = useSiteSettings();
  console.log(siteSettings, "siteSettings")

  if (isLoading) {
    return <div className="text-[#222] dark:text-white">Loading...</div>;
  }

  const aboutUsHtml = siteSettings?.termsAndCondition;

  if (!aboutUsHtml) {
    return (
      <div className="text-[#222] dark:text-white">No content available.</div>
    );
  }

  return (
    <div>
      <article
        className="text-[#222] dark:text-white
         [&_*]:!text-black
               [&_*]:!bg-transparent
               [&_a]:!text-indigo-600
               [&_h1]:text-[#222] [&_h1]:dark:text-white
               [&_h2]:text-[#222] [&_h2]:dark:text-white
               [&_h3]:text-[#222] [&_h3]:dark:text-white
               [&_h4]:text-[#222] [&_h4]:dark:text-white
                [&_p]:dark:[#222]!
               [&_li]:text-[#222] [&_li]:dark:text-gray-300
               [&_span]:text-[#222] [&_span]:dark:text-gray-300!
               [&_strong]:text-[#222] [&_strong]:dark:text-white
               [&_td]:text-[#222] [&_td]:dark:text-black
                [&_a]:dark:text-black
               [&_table]:border [&_table]:border-gray-200 [&_table]:dark:border-[#4a443f]
               [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-[#4a443f]
               [&_td]:p-2"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aboutUsHtml) }}
      />
    </div>
  );
}

export default TermsPagesCom;
