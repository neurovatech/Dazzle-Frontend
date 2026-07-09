"use client";

import { useRouter, usePathname } from "next/navigation";

export interface CategoryItem {
  uuid: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
}

interface Props {
  categories: CategoryItem[];
  activeCategorySlug: string | null;
}

export default function BrandCategoryButtons({ categories, activeCategorySlug: activeCategoryUuid }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const navigate = (slug: string | null) => {
    const qp = new URLSearchParams();
    if (slug) qp.set("category", slug);
    const qs = qp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="md:px-12.5 px-4 flex flex-row lg:flex-wrap gap-2 overflow-x-scroll lg:overflow-x-auto gap-2 flex-wrap py-3">
      {/* All button */}
      <button
        onClick={() => navigate(null)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
          activeCategoryUuid === null
            ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
            : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#6D3F0E] hover:text-[#6D3F0E] dark:hover:text-[#d4a97a]"
        }`}
      >
        All
      </button>

      {/* Category buttons */}
      {categories
        .filter((c) => c.is_active)
        .map((cat) => (
          <button
            key={cat.uuid}
            onClick={() => navigate(cat.category_slug)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              activeCategoryUuid === cat.category_slug
                ? "bg-[#6D3F0E] text-white border-[#6D3F0E]"
                : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#6D3F0E] hover:text-[#6D3F0E] dark:hover:text-[#d4a97a]"
            }`}
          >
            {cat.category_name}
          </button>
        ))}
    </div>
  );
}
