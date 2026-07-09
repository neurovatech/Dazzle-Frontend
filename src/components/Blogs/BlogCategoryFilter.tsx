"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryOption {
  value: string;
  label: string;
}

interface BlogCategoryFilterProps {
  options: CategoryOption[];
}

export default function BlogCategoryFilter({ options }: BlogCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value); // value = uuid
    }
    params.delete("page"); // reset to page 1
    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = currentCategory === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={` px-5! h-10 rounded-full text-sm font-medium transition-colors border ${
              isActive
                ? "bg-[#101828] text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}