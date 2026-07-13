/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// import { categoryNavItems } from "./types";
// import type { ApiCategory } from "./Header";

interface Props {
  categories?: any;
}

export default function CategoryNavList({ categories }: Props) {

  console.log(categories, "apiSubCategories");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLeft, setActiveLeft] = useState<number>(0);
  const [dropdownWidth, setDropdownWidth] = useState<number>(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const navElementRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const normalizedItems = categories && categories.length > 0
    ? categories.map((cat:any) => ({
        id: cat.uuid,
        name: cat.category_name,
        slug: cat.category_slug || cat.category_name.toLowerCase().replace(/\s+/g, "-"),
        submenu: (cat.child ?? []).map((sub: any) => ({
          id: sub.uuid,
          name: sub.brand_name || sub.sub_category_name,
          slug: sub.brand_slug || sub.sub_category_slug || (sub.brand_name || sub.sub_category_name || "").toLowerCase().replace(/\s+/g, "-"),
        })),
      }))
    : [];

  const activeItem = normalizedItems.find((item:any) => item.id === activeId);

  const chunkArray = (
    arr: { id: string; name: string; slug: string }[],
    size: number,
  ) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveId(null);
    }, 150);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>, itemId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveId(itemId);
    if (e.currentTarget && navElementRef.current) {
      const liRect = e.currentTarget.getBoundingClientRect();
      const navRect = navElementRef.current.getBoundingClientRect();
      const leftPos = liRect.left - navRect.left;
      setActiveLeft(leftPos);
    }
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };


  useEffect(() => {
    if (activeId && dropdownRef.current) {
      setDropdownWidth(dropdownRef.current.getBoundingClientRect().width);
    } else {
      setDropdownWidth(0);
    }
  }, [activeId, activeLeft]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const handleScrollEvent = () => {
        checkScroll();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setActiveId(null);
      };
      el.addEventListener("scroll", handleScrollEvent);
      checkScroll();
      window.addEventListener("resize", checkScroll);

      const timer = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener("scroll", handleScrollEvent);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [normalizedItems]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };


  let leftPos = activeLeft - 20;
  if (navElementRef.current && dropdownWidth > 0) {
    const navWidth = navElementRef.current.getBoundingClientRect().width;
    if (leftPos + dropdownWidth > navWidth - 10) {
      leftPos = navWidth - dropdownWidth - 10;
    }
  }

  leftPos = Math.max(10, leftPos);

  return (
    <>
      <nav 
        ref={navElementRef}
        className="items-center rounded-lg flex-1 bg-background py-1.5 px-5 w-[90%] relative"
      >
        <div className="relative w-full flex items-center">

          {showLeftArrow && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-[#2e2b28] border border-gray-200 dark:border-white/10 shadow-md text-primary hover:bg-gray-50 dark:hover:bg-[#3e3a36] transition-all"
            >
              <svg
                className="w-3.5 h-3.5 text-black dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}


          <div
            ref={scrollRef}
            className="w-full overflow-x-auto flex items-center scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-1"
          >
            <ul className="hidden md:inline-flex items-center gap-1 list-none">
              {normalizedItems.map((item:any) => {
                const isActive = activeId === item.id;
                const hasSubmenu = item.submenu && item.submenu.length > 0;

                return (
                  <li
                    key={item.id}
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, item.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="flex dark:bg-light_bg items-center gap-1 text-sm text-primary font-bold hover:text-[#222222] dark:hover:text-[#ba975f] whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors duration-150">
                      {item.name}
                      {hasSubmenu && (
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                            isActive ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

     
          {showRightArrow && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-[#2e2b28] border border-gray-200 dark:border-white/10 shadow-md text-primary hover:bg-gray-50 dark:hover:bg-[#3e3a36] transition-all"
            >
              <svg
                className="w-3.5 h-3.5 text-black dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>


        {activeId && activeItem && activeItem.submenu && activeItem.submenu.length > 0 && (
          <div
            ref={dropdownRef}
            className={`absolute pt-2 z-50 min-w-max transition-all duration-200 ${
              dropdownWidth === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{
              left: `${leftPos}px`,
              top: "100%",
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="bg-background shadow-[0_6px_10px_rgba(0,0,0,0.15)] rounded-lg">
              <div className="flex gap-0">
                {chunkArray(activeItem.submenu, 7).map((chunk, colIdx) => (
                  <div
                    key={colIdx}
                    className="min-w-40 border-l border-white/10 pl-5 pr-4"
                  >
                    <ul className="list-none -ml-10 pb-2">
                      {chunk.map((sub) => (
                        <li key={sub.id} className="px-5 leading-11.25">
                          <Link
                            href={`/categories/${activeItem.slug}/${sub.slug}`}
                            onClick={() => setActiveId(null)}
                            prefetch={false}
                            className="text-primary font-bold text-sm px-5 py-2 block hover:text-[#ba975f] transition-colors duration-200 whitespace-nowrap no-underline"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
