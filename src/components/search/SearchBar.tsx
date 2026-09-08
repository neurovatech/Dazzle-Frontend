/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SearchIcon } from "@/icon";
import RecentSearches, { addRecentSearch } from "./RecentSearches";
import ProductSearches from "./ProductSearches";
import { trackSearch } from "@/lib/analytics/pixelEvents";

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const hasQuery = query.trim().length > 0;

  // The dropdown's `top` used to come from CSS alone (`top: auto` under
  // `position: fixed`, which falls back to the box's own "static position").
  // That fallback is computed by walking the ancestor chain, and once the
  // header became `position: sticky`, it stopped reflecting where the search
  // bar is actually pinned on screen — the dropdown rendered wherever the
  // search bar would sit in the DOCUMENT's un-scrolled flow instead. Measuring
  // the wrapper's real bottom edge and setting `top` explicitly sidesteps that
  // static-position ambiguity entirely; re-measuring on scroll/resize keeps it
  // glued to the search bar even if the sticky header's own position shifts
  // while the dropdown is open.
  //
  // `dropdownCenterX` does the same job for horizontal placement on desktop.
  // The old CSS (`lg:-left-70` etc.) shifted the panel left by a fixed amount
  // relative to the search bar's own `position: relative` wrapper — that only
  // worked while the panel was `position: absolute`. Once it became `fixed`
  // (needed for `top` above), "left" is measured from the viewport instead,
  // so that same offset instead dragged the panel toward the screen's left
  // edge regardless of where the search bar actually sits. Measuring the
  // wrapper's horizontal center and centering the panel on it with a
  // `translateX(-50%)` keeps it visually centered under the search bar no
  // matter the panel's own (dynamic) width.
  const [dropdownTop, setDropdownTop] = useState<number | null>(null);
  const [dropdownCenterX, setDropdownCenterX] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    const updatePosition = () => {
      if (wrapperRef.current) {
        const r = wrapperRef.current.getBoundingClientRect();
        setDropdownTop(r.bottom);
        setDropdownCenterX(r.left + r.width / 2);
      }
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isFocused]);

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
      trackSearch(term);
      setQuery("");
      setIsFocused(false);
      inputRef.current?.blur();
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  // When user picks a recent/trending term → navigate to search page
  const handleSelectTerm = (term: string) => {
    addRecentSearch(term);
    trackSearch(term);
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();
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
          ref={inputRef}
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
          fixed left-2 right-2
          sm:right-auto sm:min-w-260
          bg-white dark:bg-[#2e2b28] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-600
          max-h-[80vh] overflow-y-auto
          transition-opacity duration-300 ease-in-out z-999
          ${
            isFocused
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        style={{
          top: dropdownTop != null ? dropdownTop + 8 : undefined,
          ...(isDesktop && dropdownCenterX != null
            ? { left: dropdownCenterX, right: "auto" }
            : {}),
          transform: isDesktop
            ? `translateX(-50%) translateY(${isFocused ? "0" : "-8px"})`
            : `translateY(${isFocused ? "0" : "-8px"})`,
          transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
        }}
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
