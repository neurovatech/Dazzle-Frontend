import BgImages from "@/images/header-bg.png";
import TopBar from "./TopBar";
import MainNav from "./MainNav";
import CategoryNav from "./CategoryNav";
import MobileHeader from "./MobileHeader";
import { api } from "@/lib/api";

// ─── API Types (categories/brands) ───────────────────────────────────────────
export interface ApiBrand {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface ApiCategory {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  child: ApiBrand[];
}

export interface ApiSubCategory {
  uuid: string;
  sub_category_name: string;
  sub_category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  child: ApiBrand[];
}

interface ApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: {
    category: ApiCategory[];
    subCategory?: ApiSubCategory[];
  };
}

// ─── Main Header (Server Component) ──────────────────────────────────────────
export default async function Header() {
  let apiCategories: ApiCategory[] = [];
  let apiSubCategories: ApiCategory[] = [];

  // 1. Fetch categories with brands
  try {
    const response = await api.get<ApiResponse>("/categories/brands", {
      cache: "no-store",
    });

    if (response?.data) {
      const cats = Array.isArray(response.data.category) ? response.data.category : [];
      const subCats = Array.isArray(response.data.subCategory) ? response.data.subCategory : [];

      apiCategories = cats
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          child: (cat.child ?? []).filter((brand) => brand.is_active),
        }));

      apiSubCategories = subCats
        .filter((sub) => sub.is_active)
        .map((sub) => ({
          uuid: sub.uuid,
          category_name: sub.sub_category_name,
          category_slug: sub.sub_category_slug,
          thumbnail_img: sub.thumbnail_img,
          is_featured: sub.is_featured,
          is_active: sub.is_active,
          child: (sub.child ?? []).filter((brand) => brand.is_active),
        }));
    }
  } catch (err) {
    console.error("[Header] categories/brands fetch failed:", err);
  }

  return (
    <header
      className="w-full font-sans transition-colors duration-300 sticky top-0 z-50 rounded-b-[20px] md:px-4 px-2 dark:bg-[#1a1a1a] dark:text-white"
      style={{
        backgroundImage: `url(${BgImages.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <TopBar />
      <MainNav />
      <CategoryNav categories={apiCategories} subCategories={apiSubCategories} />
      <MobileHeader categories={[...apiCategories, ...apiSubCategories]} />
    </header>
  );
}
