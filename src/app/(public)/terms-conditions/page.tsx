import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import React from "react";
import { api } from "@/lib/api";


export const metadata: Metadata = {
  title: "Terms and Conditions - Dazzle",
  description: "Read the Terms and Conditions of Dazzle. Review the user guidelines, account security policies, information collection rules, and liability statements.",
};

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionItem {
  label: string;
  items: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────────
const infoSections: SectionItem[] = [
  {
    label: "৩.১ ব্যক্তিগত তথ্য:",
    items: [
      "নাম",
      "ইমেইল ঠিকানা",
      "ফোন নম্বর",
      "বিলিং এবং ডেলিভারি ঠিকানা",
      "পেমেন্টের তথ্য (যদি আপনি কোনো কেনাকাটা করেন)",
      "আপনি যেকোনো তথ্য প্রদান করা বেছে নেন (যেমনটি প্রযোজ্য হয়)",
    ],
  },
  {
    label: "৩.২ ব্যক্তিগত তথ্য:",
    items: [
      "নাম",
      "ইমেইল ঠিকানা",
      "ফোন নম্বর",
      "বিলিং এবং ডেলিভারি ঠিকানা",
      "পেমেন্টের তথ্য (যদি আপনি কোনো কেনাকাটা করেন)",
      "আপনি যেকোনো তথ্য প্রদান করা বেছে নেন (যেমনটি প্রযোজ্য হয়)",
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
//     <span className="text-slate-200 font-medium">Terms and Conditions</span>
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
      আপনি আমাদের অ্যাকাউন্টটি তৈরি করতে সাহায্য করার সময় আমরা নিম্নলিখিত তথ্য
      সংগ্রহ করতে পারি:
    </p>
    <p className="text-[#222] dark:text-white font-semibold text-sm mb-2">
      {label}
    </p>
    <ul className="space-y-1.5 pl-1 list-disc list-inside">
      {items.map((item, i) => (
        <li key={i} className="text-[#222] dark:text-gray-300 text-sm">
          {/* <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#222] flex-shrink-0" /> */}
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
      "/pages/terms-condition",
      { cache: "no-store" }
    );
    // console.log("Terms and Conditions Page - Data fetched successfully:", res);
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
            Terms and Conditions
          </h1>
          <div className="h-1 w-16 rounded-full bg-linear-to-r from-indigo-500 to-violet-500 mt-3" />
        </div>

        <div className="space-y-6 ">
          {/* পরিচয় */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3 flex items-center gap-2">
              পরিচয়:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              তাফসির ওয়ার্ডপ্রেস মার্কেটপ্লেস TM-এ, আমরা আপনার গোপনীয়তাকে
              সম্মান করি এবং নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ এই তথ্যনীতিতে বিস্তৃত
              করা হয়েছে ডেটা আমাদের ব্যবহারকারীদের অ্যাকাউন্টের তথ্য সংগ্রহ করা
              সময় প্রদান করা তথ্য আমরা আপনার সম্পর্কে জানতে পারি না এটি কার্যকর
              থাকে।
            </p>
          </Card>

          {/* আমরা যে তথ্য সংগ্রহ করি */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-4 flex items-center gap-2">
              আমরা যে তথ্য সংগ্রহ করি
            </h2>
            {infoSections.map((section, i) => (
              <React.Fragment key={i}>
                <SectionBlock {...section} />
                {i < infoSections.length - 1 && (
                  <hr className="border-slate-700/60 my-5" />
                )}
              </React.Fragment>
            ))}
          </Card>

          {/* নিরাপত্তা */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold  mb-3 flex items-center gap-2">
              নিরাপত্তা:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্পমান অনুযায়ী এনক্রিপশন,
              ফায়ারওয়াল, বা অন্য কোনো পদ্ধতি ব্যবহার করে আপনার ব্যক্তিগত
              তথ্যের সুরক্ষার যথাযথ ব্যবস্থা গ্রহণ করি।
            </p>
          </Card>

          {/* এই তথ্যনীতির বিষয়ে পরিবর্তন */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3 flex items-center gap-2">
              এই তথ্যনীতির বিষয়ে পরিবর্তন:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7">
              আমরা সময়ে সময়ে প্রয়োজনীয়তা অনুযায়ী এই তথ্যনীতি আপডেট করতে
              পারি এবং আপনি এটি পর্যালোচনা করার আমরা পরামর্শ দিই। আপনার কাছে
              তথ্যনীতিটি পর্যালোচনা করার প্রস্তাব দিতে পারে এবং সংশোধন করার পর
              এটি অব্যাহত রাখার মাধ্যমে পরিবর্তনগুলি গ্রহণ করেছেন বলে ধরে নেওয়া
              হয়।
            </p>
          </Card>

          {/* যোগাযোগ করুন */}
          <Card>
            <h2 className="text-[#222] dark:text-white font-bold mb-3 flex items-center gap-2">
              যোগাযোগ করুন:
            </h2>
            <p className="text-[#222] dark:text-gray-300 text-sm leading-7 mb-4">
              আপনার যদি এই তথ্যনীতি বা আমাদের তথ্য প্রক্রিয়াকরণ সম্পর্কে কোনো
              প্রশ্ন, উদ্বেগ, বা অনুরোধ থাকে, তাহলে যেকোনো সময় আমাদের সাথে
              যোগাযোগ করুন।
            </p>
          </Card>

          {/* যোগাযোগের তথ্য যুক্ত করুন */}
          <Card>
            <div className="flex items-start gap-3">
              <h2 className="text-[#222] dark:text-white font-bold mb-3 flex items-center gap-2">
                [যোগাযোগের তথ্য যুক্ত করুন]
              </h2>

              <p className="text-[#222] dark:text-gray-300 text-sm leading-6">
                তাফসির দেওয়ার জন্য ধন্যবাদ। আমরা আপনার গোপনীয়তা এবং তথ্য
                সুরক্ষার প্রতি আমাদের অঙ্গীকার পূরণে সর্বদা সচেষ্ট থাকব (দেখতে
                আমাদের ওয়েবসাইট পরিদর্শন করুন)।
              </p>
            </div>
          </Card>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-slate-600 dark:text-gray-400">
          সর্বশেষ আপডেট: এপ্রিল ২০২৬ · সমস্ত অধিকার সংরক্ষিত
        </p>
      </div>
    </div>
  );
}
