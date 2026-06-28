"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/app/(public)/brands/page";

// ✅ Move constant outside component — stable reference, no SSR/client mismatch
const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function BrandCard({ brands }: { brands: Brand[] }) {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("All");

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = brand.label
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesLetter =
        selectedLetter === "All"
          ? true
          : brand.label.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesLetter;
    });
  }, [brands, search, selectedLetter]);

  return (
    <div className="w-full py-4">
      {/* Top Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 mb-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-4 w-full">
          <input
            type="text"
            placeholder="Search brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full h-12 rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-[#1A1A1A] px-4 text-sm text-black dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none
              focus:border-[#D4A97A] dark:focus:border-[#D4A97A]
            "
          />
        </div>

        {/* A–Z Filter */}
        <div className="lg:col-span-8 flex flex-wrap gap-2">
          {/* ✅ Use flex-wrap instead of grid — avoids invalid nesting & layout mismatch */}
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`
                min-w-9 h-9 px-3 rounded-lg text-sm font-medium border transition-all duration-300
                ${
                  selectedLetter === letter
                    ? "bg-black text-white border-black dark:bg-[#D4A97A] dark:text-black dark:border-[#D4A97A]"
                    : "bg-white text-black border-gray-300 hover:border-black dark:bg-[#1A1A1A] dark:text-white dark:border-gray-700 dark:hover:border-[#D4A97A]"
                }
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid md:grid-cols-6 grid-cols-2 lg:gap-4 gap-2">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug || brand.label}`}
              className="
                flex w-full flex-col items-center justify-center gap-2
                py-4 px-2 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-[#1A1A1A] hover:border-[#D4A97A]
                dark:hover:border-[#D4A97A] transition-all duration-300
              "
            >
              <div className="relative h-16 w-40">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.label}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <span className="text-xs text-gray-400 dark:text-gray-500 text-center px-1 leading-tight">
                      No image available
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[16px] font-medium text-black dark:text-white">
                {brand.label}
              </span>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No brands found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandCard;