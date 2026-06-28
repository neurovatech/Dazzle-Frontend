import { Percent } from "lucide-react";
import React, { useState } from "react";

const Coupons = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabsData = [
    {
      label: "Coupon Deals",
      value: "coupon_deals",
    },
    {
      label: "Points Deal",
      value: "points_deal",
    },
  ];

  // const coupons = Array(4).fill({
  //   code: "RAMADAN12",
  //   discount: "10% off upto ৳1,00,000",
  //   category: "For Phone",
  // });
  const coupons = [1, 2, 3, 4];

  return (
    <>
      {/* tabs */}
      <div className="flex flex-wrap gap-2 pb-4">
        {tabsData.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm md:text-base font-bold rounded-lg transition-all duration-300 ${
              activeTab === index
                ? "bg-[#E9CCAE] text-primary"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* coupons list */}
      <div className="flex flex-col gap-4">
        {coupons.map((_, index) => (
          <div key={index} className="relative w-full">
            {/* Left Semi-circle cut-out */}
            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10 border-r border-gray-200"></div>

            {/* Right Semi-circle cut-out */}
            <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10 border-l border-gray-200"></div>

            <div className="bg-[#F7F7F7] dark:bg-[#393430] border border-[#E7E7E7] rounded-2xl overflow-hidden">
              {/* Top Section */}
              <div className="pt-2.5 pb-3 px-3.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="bg-[#7332E1] p-0.5 rounded-md">
                    <Percent size={11} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-[#747474] dark:text-gray-300 uppercase tracking-wider">
                    RAMADAN12
                  </span>
                </div>
                <h2 className="text-base font-medium">
                  <span className="text-[#222222] dark:text-white">
                    10% off upto
                  </span>{" "}
                  <span className="text-[#575757] dark:text-gray-300">
                    ৳ 1,00,000
                  </span>
                </h2>
              </div>

              {/* Dashed Divider */}
              <div className="relative border-t border-dashed border-[#B5B5B5] mx-3"></div>

              {/* Bottom Section */}
              <div className="py-3 px-3.5 flex justify-between items-center bg-[#F7F7F7] dark:bg-[#393430]">
                <p className="text-xs text-[#747474] font-medium">For Phone</p>
                <button className="px-3.5 py-2 border border-[#E9CCAE] text-[#6D3F0E] font-semibold rounded-xl bg-white hover:bg-[#fdf8f3] transition-colors shadow-[0px_0px_6px_3px_#E9CCAE52]">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Coupons;
