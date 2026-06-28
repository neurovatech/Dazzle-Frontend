"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TradeInPage = () => {
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

  return (
    <div className="bg-[#FFFBF6] md:bg-white md:dark:bg-[#302d29] font-sans p-5 pb-20 max-w-355 mx-auto">
      <h1 className="text-3xl font-semibold text-[#101518] dark:text-white py-10 text-center">
        Trade in your Device
      </h1>
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div>
          <h2 className="text-[22px] font-medium mb-6">How it works</h2>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-[#EBEBEB] dark:bg-[#444] p-4 rounded-sm"
              >
                <div className="flex items-center justify-center bg-[#E9CCAE] rounded p-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
                <p className="leading-tight">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#302d29] p-12 rounded-sm shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h2 className="text-xl mb-10">Select category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {["Smart Phone", "Laptop", "Tablet", "Smart Watch"].map((cat) => (
              <button
                key={cat}
                className="py-6 px-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors bg-white dark:bg-[#302d29] dark:border-gray-600 dark:hover:bg-[#444]"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-20">
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
