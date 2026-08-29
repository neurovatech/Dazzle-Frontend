"use client";
import React from "react";

interface SpecItem {
  label: string;
  value: string;
}

interface SpecGroup {
  title: string;
  items: SpecItem[];
}

interface ProductSpecificationsProps {
  /** Groups from /product-specification/{productUuid}, already mapped. */
  groups: SpecGroup[];
}

/**
 * Renders whatever the specification API returned — and nothing else.
 *
 * This component used to carry a hardcoded `fallbackGroups` array of iPhone 17
 * Pro Max specs (dimensions, weight, Ceramic Shield build, SIM details) that it
 * rendered whenever `groups` was empty. Because /product-specification answers
 * { found: false, data: [] } for every product right now, EVERY product page was
 * showing those invented iPhone specs as if they were its own — a smartwatch
 * listed at 233 g with a 6.9" Super Retina display.
 *
 * Inventing product data is worse than showing none, so the fallback is gone. An
 * empty result now says so plainly; the real copy lives in the Description
 * section rendered directly below this one.
 */
const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  groups,
}) => {
  if (!groups || groups.length === 0) {
    // console.log(groups, "groupsgroupsgroupsgroups");
    
    return (
      <div className="w-full rounded-2xl border border-gray-200 dark:border-[#3a2f28] bg-white dark:bg-[#1f1a16] px-5 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Specifications for this product are not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="flex flex-col gap-4">
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="rounded-2xl border border-gray-200 dark:border-[#3a2f28] overflow-hidden bg-white dark:bg-[#1f1a16] transition-colors"
            >
              {/* Group title */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-[#2a211c] border-b border-gray-200 dark:border-[#3a2f28]">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {group.title}
                </span>
              </div>

              {/* Spec rows */}
              <div className="divide-y divide-gray-100 dark:divide-[#3a2f28] bg-[#F7F7F7] dark:bg-[#171210] p-3">
                {group.items.map((item, ii) => (
  <div
    key={ii}
    className="grid grid-cols-[80px_1fr] sm:grid-cols-[200px_1fr] px-5 md:py-3.5 py-1 gap-3 sm:gap-4 bg-white dark:bg-[#221a16] mb-1 rounded-lg transition-colors"
  >
    <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {item.label}
    </span>

    <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
      {item.value}
    </span>
  </div>
))}
              </div>
            </div>
          ))}
        </div>

    </div>
  );
};

export default ProductSpecifications;
