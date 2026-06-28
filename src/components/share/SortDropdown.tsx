"use client";

import { useState, useRef, useEffect } from "react";

type SortOption = {
  label: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { label: "Recommend", value: "recommend" },
  { label: "Newest", value: "newest" },
  { label: "Lowest - Highest", value: "lowest_highest" },
  { label: "Highest - Lowest", value: "highest_lowest" },
];

export default function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SortOption>(sortOptions[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SortOption) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="flex items-start justify-end">
      <div className="relative" ref={dropdownRef}>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-[#6b5a4e] bg-white dark:bg-[#3e3329] text-sm font-medium text-gray-800 dark:text-[#f5ede6] shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-500"
        >
          {selected.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 text-gray-500 dark:text-[#c4a882] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        {/* Dropdown Panel */}
        <div
          className={`absolute right-0 mt-2 w-64 bg-white dark:bg-[#3e3329] rounded-2xl shadow-xl border border-gray-100 dark:border-[#5c4a3d] overflow-hidden origin-top-right z-50
            ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
          style={{ transition: "opacity 200ms ease, transform 200ms ease" }}
        >
          <ul className="py-1">
            {sortOptions.map((option, idx) => (
              <li key={option.value}>
                <button
                  onClick={() => handleSelect(option)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm dark:hover:bg-[#4e4038] transition-colors duration-150 focus:outline-none"
                >
                  <span
                    className={`font-medium ${
                      selected.value === option.value
                        ? "text-gray-900 dark:text-[#f5ede6]"
                        : "text-gray-600 dark:text-[#b09880]"
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Radio circle */}
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${
                        selected.value === option.value
                          ? "border-amber-400 bg-amber-50 dark:bg-[#6b4c1e]"
                          : "border-gray-300 dark:border-[#6b5a4e] bg-white dark:bg-[#3e3329]"
                      }`}
                  >
                    {selected.value === option.value && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                    )}
                  </span>
                </button>

                {/* Divider */}
                {idx < sortOptions.length - 1 && (
                  <hr className="mx-5 border-[#5c4a3d]" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}