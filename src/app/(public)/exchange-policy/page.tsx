import type { Metadata } from "next";
import React from "react";
import { api } from "@/lib/api";


export const metadata: Metadata = {
  title: "Exchange Policy - Dazzle",
  description: "Read the Exchange Policy of Dazzle. Understand how to exchange products, requirements for used mobile phone trade-ins, and depreciation conditions.",
};

// ── Components ───────────────────────────────────────────────────────────────
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] p-6">
    {children}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
async function ExchangePolicy() {

  
  
    try {
      const res = await api.get<{ data: Record<string, unknown>[] }>(
        "/pages/exchange-policy",
        { cache: "no-store" }
      );
      // console.log("Exchange Policy Page - Brands fetched successfully:", res);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
    const isExpectedNotFound = /not found/i.test(message);
    if (!isExpectedNotFound) {
      console.error("Error fetching warranty policy data:", error);
    }
    }

  return (
    <div className="max-w-355 mx-auto px-4 md:px-12.5 pt-5">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Exchange Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          এক্সচেঞ্জ নীতি
        </p>
      </div>

      <div className="space-y-6">
        {/* Intro */}
        <Card>
          <p className="text-sm leading-7 text-[#222] dark:text-gray-300">
            সম্মানিত গ্রাহক, আমাদের এক্সচেঞ্জ নীতি নিম্নরূপ:
          </p>
        </Card>

        {/* Exchange Process */}
        <Card>
          <h2 className="font-bold mb-3">এক্সচেঞ্জ প্রক্রিয়া:</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>কোনো পণ্য এক্সচেঞ্জ করতে হলে আমাদের আউটলেটে ভিজিট করতে হবে</li>
            <li>এক্সচেঞ্জের ক্ষেত্রে ডেলিভারি/কুরিয়ার চার্জ প্রযোজ্য</li>
            <li>রিটার্ন শিপিং খরচ গ্রাহককে বহন করতে হবে</li>
          </ul>
        </Card>

        {/* Old Phone Conditions */}
        <Card>
          <h2 className="font-bold mb-3">পুরোনো ফোন এক্সচেঞ্জ শর্তসমূহ:</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>ফোনটি সম্পূর্ণ কার্যকর ও ভালো অবস্থায় থাকতে হবে</li>
            <li>ডিসপ্লে, ব্যাটারি ও অন্যান্য অংশ অক্ষত থাকতে হবে</li>
            <li>বর্তমান বাজার মূল্য অনুযায়ী এক্সচেঞ্জ ভ্যালু নির্ধারিত হবে</li>
            <li>২% – ১৫% পর্যন্ত অতিরিক্ত ভ্যালু পাওয়া যেতে পারে</li>
            <li>অরিজিনাল IMEI বক্স থাকতে হবে</li>
            <li>Dazzle টিম চূড়ান্ত মূল্য নির্ধারণ করবে</li>
          </ul>
        </Card>

        {/* Price Deduction */}
        <Card>
          <h2 className="font-bold mb-3">১ মাসের মধ্যে এক্সচেঞ্জ:</h2>
          <ul className="space-y-2 text-sm text-[#222] dark:text-gray-300 list-disc list-inside">
            <li>অফিসিয়াল প্রোডাক্ট: ৩০% কমে যাবে</li>
            <li>ইমপোর্টেড প্রোডাক্ট: ২০% কমে যাবে</li>
          </ul>
        </Card>

        {/* Note */}
        <Card>
          <p className="text-sm text-[#222] dark:text-gray-300 leading-7">
            বিঃদ্রঃ এই এক্সচেঞ্জ নীতি আমাদের Terms and Conditions এর অংশ। আমাদের
            ওয়েবসাইট ব্যবহার করে আপনি এই নীতিগুলি পড়েছেন, বুঝেছেন এবং সম্মত
            হয়েছেন বলে গণ্য হবেন। কোনো প্রশ্ন থাকলে আমাদের গ্রাহক সেবা দলের
            সাথে যোগাযোগ করুন।
          </p>
        </Card>
      </div>

      {/* Footer */}
      <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        সর্বশেষ আপডেট: এপ্রিল ২০২৬
      </p>
    </div>
  );
}
export default ExchangePolicy;