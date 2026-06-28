import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import React from "react";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Refund Policy - Dazzle",
  description:
    "Check the Refund Policy of Dazzle. Understand under what conditions you can request a refund, refund processing times, and exclusion policies.",
};

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionItem {
  label: string;
  items: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────────
const infoSections: SectionItem[] = [
  {
    label: "রিফান্ডের শর্তাবলী:",
    items: [
      "পণ্য ডেলিভারির পর ৭ দিনের মধ্যে রিফান্ড আবেদন করতে হবে",
      "পণ্যটি অবশ্যই অব্যবহৃত এবং মূল অবস্থায় থাকতে হবে",
      "মূল প্যাকেজিং এবং ইনভয়েস থাকতে হবে",
      "ক্ষতিগ্রস্ত বা ত্রুটিযুক্ত পণ্যের ক্ষেত্রে রিফান্ড প্রযোজ্য",
    ],
  },
  {
    label: "যে ক্ষেত্রে রিফান্ড প্রযোজ্য নয়:",
    items: [
      "ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য",
      "গ্রাহকের ভুল অর্ডার",
      "ডিসকাউন্ট বা অফার পণ্য (শর্ত সাপেক্ষে)",
      "ডিজিটাল বা নন-রিটার্নেবল পণ্য",
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
// const Breadcrumb = () => (
//   <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
//     <a
//       href="#"
//       className="hover:text-indigo-400 transition-colors duration-200"
//     >
//       Home
//     </a>
//     <span className="text-slate-600">›</span>
//     <span className="text-slate-200 font-medium">Refund Policy</span>
//   </nav>
// );

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] backdrop-blur-sm p-6 ${className}`}
  >
    {children}
  </div>
);

const SectionBlock = ({ label, items }: SectionItem) => (
  <div className="mb-6 last:mb-0">
    <p className="text-[#222] dark:text-gray-300 text-sm mb-3 leading-relaxed">
      নিচের শর্ত অনুযায়ী রিফান্ড প্রক্রিয়া প্রযোজ্য:
    </p>
    <p className="text-[#222] dark:text-white font-semibold text-sm mb-2">
      {label}
    </p>
    <ul className="space-y-1.5 pl-1 list-disc list-inside">
      {items.map((item, i) => (
        <li key={i} className="text-[#222] dark:text-gray-300 text-sm">
          {/* <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#222]" /> */}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Support Center", href: "#" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TermsConditions() {
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/pages/refund-policy",
      { cache: "no-store" },
    );
    // console.log("Refund Policy Page - Data fetched successfully:", res);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
  }
  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4 pt-5">
        {/* Breadcrumb */}
        <div className="max-w-350 mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white mb-1">
            Refund Policy
          </h1>
          <div className="h-1 w-16 rounded-full bg-linear-to-r from-indigo-500 to-violet-500 mt-3" />
        </div>

        <div className="space-y-6">
          {/* পরিচয় */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3">
              পরিচয়:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              ড্যাজলে আপনাকে স্বাগতম! আমরা আমাদের গ্রাহকদের সর্বোচ্চ সন্তুষ্টি
              নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। এই রিফান্ড নীতিতে বর্ণনা করা হয়েছে
              কোন পরিস্থিতিতে আপনি রিফান্ড পেতে পারেন এবং কীভাবে সেই প্রক্রিয়া
              সম্পন্ন হবে।
            </p>
          </Card>

          {/* রিফান্ড শর্ত */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-4">
              রিফান্ডের শর্তাবলী:
            </h2>
            {infoSections.map((section, i) => (
              <React.Fragment key={i}>
                <SectionBlock {...section} />
              </React.Fragment>
            ))}
          </Card>

          {/* রিফান্ড প্রক্রিয়া */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3">
              রিফান্ড প্রক্রিয়া:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              আপনার রিফান্ড অনুরোধ অনুমোদিত হলে, আমরা ৫-১০ কার্যদিবসের মধ্যে
              আপনার পেমেন্ট মূল পেমেন্ট পদ্ধতিতে ফেরত পাঠাব। ব্যাংক বা পেমেন্ট
              গেটওয়ের উপর নির্ভর করে সময় ভিন্ন হতে পারে।
            </p>
          </Card>

          {/* নীতির পরিবর্তন */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3">
              নীতির পরিবর্তন:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              আমরা যেকোনো সময় এই রিফান্ড নীতি পরিবর্তন করার অধিকার সংরক্ষণ করি।
              আপডেট করা নীতি আমাদের ওয়েবসাইটে প্রকাশ করা হবে।
            </p>
          </Card>

          {/* যোগাযোগ */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3">
              যোগাযোগ করুন:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7 mb-4">
              রিফান্ড সম্পর্কিত যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে
              যোগাযোগ করুন।
            </p>
          </Card>

          {/* যোগাযোগের তথ্য */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3">
              যোগাযোগের তথ্য:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-6">
              ইমেইল: admin@dazzle.com.bd <br />
              ফোন: 09638001122
            </p>
          </Card>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-slate-600 dark:text-gray-400">
          সর্বশেষ আপডেট: এপ্রিল ২০২৬ · সমস্ত অধিকার সংরক্ষিত
        </p>
      </div>
    </div>
  );
}
