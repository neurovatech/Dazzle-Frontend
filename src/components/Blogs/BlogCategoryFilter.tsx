"use client";

import { useRouter, useSearchParams } from "next/navigation";
import GlobalSelect from "@/components/ui/Select";

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.set("page", "1");
    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <GlobalSelect
      fullWidth={false}
      variant="pill"
      size="sm"
      value={currentCategory}
      options={options}
      onChange={handleChange}
    />
  );
}