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

interface ApiResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: ApiCategory[];
}

// ─── API Types (categories/child) ────────────────────────────────────────────
export interface ApiSubCategory {
  uuid: string;
  sub_category_name: string;
  sub_category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface ApiChildCategory {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  child: ApiSubCategory[];
}

interface ApiChildResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: ApiChildCategory[];
}

// ─── Main Header (Server Component) ──────────────────────────────────────────
export default async function Header() {
  let apiCategories: ApiCategory[] = [];
  let apiChildCategories: ApiChildCategory[] = [];

  // 1. Fetch categories with brands
  try {
    const response = await api.get<ApiResponse>("/categories/brands", {
      cache: "no-store",
    });

  
    

    if (response?.data && Array.isArray(response.data)) {
      apiCategories = response.data
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          child: (cat.child ?? []).filter((brand) => brand.is_active),
        }));
    }
  } catch (err) {
    console.error("[Header] categories/brands fetch failed:", err);
  }

  // 2. Fetch categories with subcategories
  try {
    const responseChild = await api.get<ApiChildResponse>("/categories/child", {
      cache: "no-store",
    });

    if (responseChild?.data && Array.isArray(responseChild.data)) {
      apiChildCategories = responseChild.data
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          child: (cat.child ?? []).filter((sub) => sub.is_active),
        }));
    }
  } catch (err) {
    console.error("[Header] categories/child fetch failed:", err);
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
      <CategoryNav categories={apiCategories} childCategories={apiChildCategories} />
      <MobileHeader categories={apiCategories} />
    </header>
  );
}
