/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SearchIcon } from "@/icon";
import RecentSearches, { addRecentSearch } from "./RecentSearches";
import ProductSearches from "./ProductSearches";

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    setIsFocused(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsFocused(false);
  };

  // Navigate to search page on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      const term = query.trim();
      addRecentSearch(term);
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  // When user picks a recent/trending term → navigate to search page
  const handleSelectTerm = (term: string) => {
    addRecentSearch(term);
    setQuery(term);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={wrapperRef} className="flex-1 relative">
      {/* ── Input ── */}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-400 transition-colors">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for the item"
          className="w-full text-[16px] bg-background dark:text-[#ffffff] text-gray-800 placeholder-gray-400 rounded-[10px] px-5 pl-11 py-2.5 text-sm outline-none border border-transparent focus:border-[#D4A97A]/50 transition-all duration-200 lg:h-13.5 h-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Dropdown Panel ── */}
      <div
        className={`
          fixed  left-2 md:-left-70 lg:-left-70 right-2 top-auto
          sm:absolute  sm:right-auto sm:min-w-260
          mt-2 sm:mt-0 sm:top-[calc(100%+8px)]
          bg-white dark:bg-[#2e2b28] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-600
          max-h-[80vh] overflow-y-auto
          transition-all duration-300 ease-in-out z-999
          ${
            isFocused
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
      >
        {!hasQuery && (
          <RecentSearches onSelectTerm={handleSelectTerm} onClose={handleClose} />
        )}
        {hasQuery && (
          <ProductSearches query={query} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
