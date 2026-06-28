import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import React from "react";
import { api } from "@/lib/api";



export const metadata: Metadata = {
  title: "Privacy Policy - Dazzle",
  description: "Read the Privacy Policy of Dazzle. Understand how we collect, use, protect, and handle your personal data when using our website and services.",
};

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionItem {
  label: string;
  items: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────────
const infoSections: SectionItem[] = [
  {
    label: "২.১ ব্যক্তিগত তথ্য:",
    items: [
      "নাম",
      "ইমেইল ঠিকানা",
      "ফোন নম্বর",
      "শিপিং এবং বিলিং ঠিকানা",
      "অর্থপ্রদানের তথ্য (যদি আপনি কোনো ক্রয় করেন)",
      "আপনি স্বেচ্ছায় প্রদান করা অন্য যেকোনো তথ্য",
    ],
  },
  {
    label: "২.২ অ-ব্যক্তিগত তথ্য:",
    items: [
      "ব্রাউজারের তথ্য",
      "ডিভাইসের তথ্য (যেমন, ডিভাইসের ধরন, অপারেটিং সিস্টেম)",
      "আইপি ঠিকানা",
      "কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি",
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
// const Breadcrumb = () => (
//   <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
//     <a href="#" className="transition">
//       Home
//     </a>
//     <span>›</span>
//     <span className="font-medium">Privacy Policy</span>
//   </nav>
// );

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] p-6">
    {children}
  </div>
);

const SectionBlock = ({ label, items }: SectionItem) => (
  <div className="mb-6">
    <p className="text-[#222] dark:text-gray-300 font-semibold text-sm mb-2">
      {label}
    </p>
    <ul className="space-y-2 list-disc list-inside text-sm text-[#222] dark:text-gray-300">
      {items.map((item, i) => (
        <li key={i}>
          {/* <span className="mt-2 w-1.5 h-1.5 bg-[#222] dark:bg-gray-500 rounded-full" /> */}
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
export default async function PrivacyPolicy() {

   try {
        const res = await api.get<{ data: Record<string, unknown>[] }>(
          "/pages/privacy-policy",
          { cache: "no-store" }
        );
        // console.log("Privacy Policy Page - Data fetched successfully:", res);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
      }
  return (
    <div className="flex flex-col max-w-355 mx-auto">
      <div className="md:px-12.5 px-4 pt-5">
        {/* Breadcrumb */}
        <div className="max-w-350 mx-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            গোপনীয়তা নীতি
          </p>
        </div>

        <div className="space-y-6">
          {/* পরিচয় */}
          <Card>
            <h2 className="font-bold mb-3">পরিচয়:</h2>
            <p className="text-sm leading-7 text-[#222] dark:text-gray-300">
              ড্যাজলে আপনাকে স্বাগতম! ড্যাজল TM এ, আমরা আপনার ব্যক্তিগত তথ্যের
              গোপনীয়তা এবং নিরাপত্তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা
              নীতিতে উল্লেখ করা হয়েছে কিভাবে আমরা আপনার তথ্য সংগ্রহ, ব্যবহার,
              প্রকাশ এবং সুরক্ষা করি। আমাদের ওয়েবসাইট ব্যবহার করে আপনি এই নীতির
              সাথে সম্মত হচ্ছেন।
            </p>
          </Card>

          {/* তথ্য সংগ্রহ */}
          <Card>
            <h2 className="font-bold mb-4">আমরা যে তথ্য সংগ্রহ করি:</h2>
            {infoSections.map((section, i) => (
              <SectionBlock key={i} {...section} />
            ))}
          </Card>

          {/* ব্যবহার */}
          <Card>
            <h2 className="font-bold mb-3">
              আপনার তথ্য আমরা কীভাবে ব্যবহার করি:
            </h2>

            <p className="font-semibold text-sm mb-2">৩.১ পরিষেবা প্রদান:</p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>আপনার অ্যাকাউন্ট নিবন্ধন ও অ্যাক্সেস প্রদান</li>
              <li>অর্ডার ও পেমেন্ট প্রক্রিয়াকরণ</li>
              <li>গ্রাহক সহায়তা প্রদান</li>
            </ul>

            <p className="font-semibold text-sm mt-4 mb-2">
              ৩.২ মার্কেটিং এবং যোগাযোগ:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>নিউজলেটার ও অফার পাঠানো</li>
              <li>অভিজ্ঞতা ব্যক্তিগতকরণ</li>
            </ul>

            <p className="font-semibold text-sm mt-4 mb-2">৩.৩ বিশ্লেষণ:</p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>ওয়েবসাইট উন্নত করা</li>
              <li>নিরাপত্তা বৃদ্ধি</li>
            </ul>
          </Card>

          {/* তথ্য শেয়ার */}
          <Card>
            <h2 className="font-bold mb-3">আপনার তথ্য প্রকাশ:</h2>
            <p className="text-sm leading-7">
              আমরা প্রয়োজন অনুযায়ী পরিষেবা প্রদানকারী, আইনি কর্তৃপক্ষ বা
              ব্যবসায়িক স্থানান্তরের ক্ষেত্রে তথ্য শেয়ার করতে পারি।
            </p>
          </Card>

          {/* অধিকার */}
          <Card>
            <h2 className="font-bold mb-3">আপনার পছন্দ:</h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>তথ্য আপডেট বা সংশোধন</li>
              <li>মার্কেটিং থেকে বের হওয়া</li>
              <li>কুকিজ নিয়ন্ত্রণ</li>
            </ul>
          </Card>

          {/* নিরাপত্তা */}
          <Card>
            <h2 className="font-bold mb-3">নিরাপত্তা:</h2>
            <p className="text-sm">
              আমরা আপনার তথ্য সুরক্ষার জন্য যথাযথ ব্যবস্থা গ্রহণ করি।
            </p>
          </Card>

          {/* পরিবর্তন */}
          <Card>
            <h2 className="font-bold mb-3">নীতির পরিবর্তন:</h2>
            <p className="text-sm">আমরা সময়ে সময়ে এই নীতি আপডেট করতে পারি।</p>
          </Card>

          {/* যোগাযোগ */}
          <Card>
            <h2 className="font-bold mb-3">যোগাযোগ করুন:</h2>
            <p className="text-sm">
              ইমেইল: admin@dazzle.com.bd <br />
              ফোন: 09638001122
            </p>
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
          সর্বশেষ আপডেট: এপ্রিল ২০২৬
        </p>
      </div>
    </div>
  );
}
