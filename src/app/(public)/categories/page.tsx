/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import CategoriesCardPage from "@/components/HomePage/Categories/CategoriesCardPage";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Product Categories",
  description:
    "Explore all product categories at Dazzle, including Smartphones, Laptops, Smartwatches, Audio, Power Banks, and other gadget accessories.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryItem {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
}

interface CategoriesApiResponse {
  data: Record<string, unknown>[];
  totalPages?: number;
  totalCount?: number;
  page?: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CategoriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function Categories({ searchParams }: CategoriesPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam ?? "1"));
  const limit = 16;

  let categories: CategoryItem[] = [];
  let totalPages = 1;

  try {
    const res = await api.get<CategoriesApiResponse>(
      `/categories?page=${currentPage}&limit=${limit}`,
      { next: { revalidate: 5 } },
    );

    const list = Array.isArray(res) ? res : (res?.data ?? []);

    categories = list.map((c) => ({
      uuid: String(c.uuid ?? ""),
      category_name: String(c.category_name ?? ""),
      category_slug: String(c.category_slug ?? ""),
      thumbnail_img: c.thumbnail_img ? String(c.thumbnail_img) : "",
      is_featured: Boolean(c.is_featured),
      is_active: Boolean(c.is_active),
    }));

    totalPages = Number(
      Array.isArray(res) ? 1 : ((res as any)?.totalPages ?? 1),
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
  ];

  return (
    <div className=" bg-[#fffbf6] dark:bg-[#2e2b28]">
      <div className="flex flex-col flex-1 max-w-355 mx-auto ">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <CategoriesCardPage
          seeAllBtn={false}
          categories={categories}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}

export default Categories;
