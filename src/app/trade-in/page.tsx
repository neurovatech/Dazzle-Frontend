"use client";

import { ChevronDown, LogIn, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import TradeInWizard from "@/components/TradeIn/TradeInWizard";
import { useState } from "react";

const TradeInPage = () => {
  const token = useAppSelector((state) => state.auth.token);

    const [openIndex, setOpenIndex] = useState(0);

  const steps = [
    "Provide device details and get a price quote",
    "Book a home pick-up or visit the nearest Dazzle store",
    "Your device will be assessed for condition",
    "Opt for a certified data wipe service",
    "Trade-in and get instant cash on home pickup or Dazzle Voucher on Store drop-off",
  ];

  const faqs = [
    {
      question: "What services does you offer?",
      answer:
        "Vitae cursus ac ornare amet et ante felis imperdiet. Volutpat vitae id a lacinia egestas tincidunt adipiscing egestas commodo. Tellus lectus sit justo lobortis tristique elementum. Sed quisque vitae feugiat amet. Faucibus id morbi in urna facilisis. Risus eget neque pharetra sed sit. Porttitor fusce justo ipsum molestie scelerisque. Suscipit vestibulum lectus convallis eget nulla quis vitae sapien.",
    },
    {
      question: "Can you provide previous work?",
      answer:
        "Our previous work includes collaborations with top tech retailers and individual trade-in assessments globally. We ensure transparency in every step of the process, from valuation to data destruction.",
    },
    {
      question: "The right strategy for client?",
      answer:
        "We focus on providing the best market value for used devices while maintaining a secure and eco-friendly disposal or resale strategy tailored to client needs.",
    },
  ];


  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 max-w-355 mx-auto">
        <div className="bg-white dark:bg-[#302d29] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 px-10 py-12 flex flex-col items-center gap-5 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFF8EC] dark:bg-[#3e2e1a] flex items-center justify-center">
            <ShieldCheck size={28} className="text-[#6D3F0E]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Login Required
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Please log in to your Dazzle account to access the Trade-In service
            and get an instant quote for your device.
          </p>
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
          >
            <LogIn size={16} />
            Please Login First
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/registration" className="text-[#6D3F0E] dark:text-[#d4a97a] hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Logged in — full wizard ────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#181614] min-h-screen">
      <TradeInWizard />

      <div className="pt-20 max-w-350 mx-auto px-4">
        <h2 className="text-2xl font-medium text-center mb-10">FAQ</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#302d29] p-6 rounded shadow-sm border border-gray-50 h-fit">
            <h3 className="font-medium text-lg mb-6">Help & Knowledge Base</h3>
            <div className="space-y-3">
              {[
                "Account",
                "Loyality Reward",
                "Account",
                "Loyality Reward",
                "Account",
                "Loyality Reward",
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#EDEDED] dark:bg-[#444] dark:text-white p-3 text-sm rounded text-gray-600 cursor-pointer hover:bg-[#E9CCAE] dark:hover:bg-[#555] transition-colors"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-[#302d29] p-8 rounded shadow-sm border border-gray-50">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? -1 : index)
                    }
                    className="flex justify-between items-center w-full text-left focus:outline-none"
                  >
                    <h4 className="font-medium text-lg">{faq.question}</h4>
                    <div className="bg-gray-200 rounded-full p-1">
                      <ChevronDown
                        size="15"
                        className={`text-gray-500 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-height duration-300 ${openIndex === index ? "max-h-screen" : "max-h-0"}`}
                  >
                    <p
                      className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-4 border-t border-gray-200 transition-all duration-300 ${
                        openIndex === index
                          ? "border-t border-gray-200 pt-4"
                          : ""
                      }`}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TradeInPage;
