import type { Metadata } from "next";
import React from "react";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Warranty Policy - Dazzle",
  description:
    "Learn about the Dazzle Warranty Policy. Find information about parts warranty, Dazzle Care+ (Apple and Android), Extended Warranty, replacement terms, and how to claim warranty.",
};

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionItem {
  label: string;
  items: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────────
const sections: SectionItem[] = [
  {
    label: "১. Parts Warranty",
    items: [
      "স্মার্টফোন ও গ্যাজেটের জন্য প্রযোজ্য",
      "পণ্যের মূল্যের 4.25%–7.99% দিয়ে ক্রয়ের সময় যুক্ত করা যায়",
      "ডিসপ্লে, ব্যাটারি, মাদারবোর্ড, ক্যামেরা সমস্যা কভার করে",
      "ফায়ার, পানি ও ফিজিক্যাল ড্যামেজ কভার করে না",
    ],
  },
  {
    label: "২. Dazzle Care+ (Apple)",
    items: [
      "iPhone, iPad, MacBook এর জন্য",
      "একবার নতুন ডিভাইস রিপ্লেসমেন্ট (3–5 দিন)",
      "হার্ডওয়্যার সমস্যা কভার",
      "ফায়ার, পানি ও ফিজিক্যাল ড্যামেজ কভার নয়",
    ],
  },
  {
    label: "৩. Dazzle Care+ (Android)",
    items: [
      "Android, Tab, Laptop এর জন্য",
      "একবার নতুন রিপ্লেসমেন্ট",
      "3 সপ্তাহের মধ্যে দ্রুত সার্ভিস",
      "সফটওয়্যার ইস্যু ফ্রি রিপেয়ার",
    ],
  },
  {
    label: "৪. Gadget Extended Warranty",
    items: [
      "Smartwatch, headphone, speaker এর জন্য",
      "৩ মাস বেসিক + ২৪ মাস পর্যন্ত এক্সটেনশন",
      "পারফরমেন্স ও ব্যাটারি কভার",
      "ফিজিক্যাল ড্যামেজ কভার নয়",
    ],
  },
  {
    label: "৫. Dazzle Ultimate Care+",
    items: [
      "১ বছর নতুন ডিভাইস রিপ্লেসমেন্ট",
      "এক্সিডেন্টাল ড্যামেজ পার্টস কভার",
      "৩–৭ দিনের মধ্যে রিপ্লেসমেন্ট",
    ],
  },
];

// ── Components ───────────────────────────────────────────────────────────────
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] p-6">
    {children}
  </div>
);

const SectionBlock = ({ label, items }: SectionItem) => (
  <div className="mb-6">
    <p className="font-semibold mb-2 text-[#222] dark:text-white">{label}</p>
    <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
      {items.map((item, i) => (
        <li key={i} className="">
          {/* <span className="w-1.5 h-1.5 mt-2 bg-black rounded-full" /> */}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function WarrantyPolicy() {
  try {
    const res = await api.get<{ data: Record<string, unknown>[] }>(
      "/pages/loyalty-program-policy",
      { cache: "no-store" },
    );
    // console.log("Loyalty Program Policy Page - Data fetched successfully:", res);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching loyalty program policy data:", error);
    }

    // console.error("Error fetching loyalty program policy data:", error);
  }
  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Loyalty Program Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Dazzle Loyalty Program Policy & Terms and Conditions
        </p>
      </div>

      <div className="space-y-6">
        {/* Intro */}
        <Card>
          <p className="text-sm leading-7 text-[#222] dark:text-gray-300">
            Dazzle is committed to providing customers with top-notch service
            and reliable product support. All products come with a 14-day
            instant replacement guarantee for hardware issues from purchase
            date.
          </p>
        </Card>

        {/* Sections */}
        <Card>
          {sections.map((section, i) => (
            <SectionBlock key={i} {...section} />
          ))}
        </Card>

        {/* Replacement Policy */}
        <Card>
          <h2 className="font-bold mb-3">Replacement Policy</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>১ বার নতুন ডিভাইস রিপ্লেসমেন্ট</li>
            <li>স্টকে থাকলে ইনস্ট্যান্ট রিপ্লেসমেন্ট</li>
            <li>না থাকলে ৩–৭ দিনে রিপ্লেসমেন্ট</li>
            <li>পানি, আগুন বা ফিজিক্যাল ড্যামেজ কভার নয়</li>
          </ul>
        </Card>

        {/* General Terms */}
        <Card>
          <h2 className="font-bold mb-3">General Terms</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>১৪ দিনের হার্ডওয়্যার রিপ্লেসমেন্ট</li>
            <li>সফটওয়্যার ইস্যু কভার নয়</li>
            <li>লিকুইড ড্যামেজ কভার নয়</li>
            <li>আনঅথরাইজড রিপেয়ার করলে ওয়ারেন্টি বাতিল</li>
          </ul>
        </Card>

        {/* Claim */}
        <Card>
          <h2 className="font-bold mb-3">How to Claim</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>ডিভাইস + বক্স নিয়ে সার্ভিস সেন্টারে যান</li>
            <li>টিম যাচাই করবে</li>
            <li>নির্ধারিত সময়ে সার্ভিস সম্পন্ন</li>
          </ul>
        </Card>
      </div>

      <p className="mt-10 text-center text-xs text-gray-500">
        সর্বশেষ আপডেট: এপ্রিল ২০২৬
      </p>
    </div>
  );
}
