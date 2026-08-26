/* eslint-disable @typescript-eslint/no-explicit-any */
import BgImages from "@/images/header-bg.png";
import TopBar from "./TopBar";
import MainNav from "./MainNav";
import CategoryNav from "./CategoryNav";
import MobileHeader from "./MobileHeader";
import { api } from "@/lib/api";

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

async function fetchCategories(): Promise<{
  apiCategories: ApiCategory[];
  apiSubCategories: ApiCategory[];
}> {
  try {
    const response = await api.get<ApiResponse>("/categories/child", {
      next: { revalidate: 300 },
    });

    if (response?.data) {
      const cats = Array.isArray(response.data) ? response.data : [];

      const apiCategories = cats
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          child: (cat.child ?? []).filter((sub: any) => sub.is_active),
        }));
      const apiSubCategories = cats
        .flatMap((cat) => cat.child ?? [])
        .filter((sub: any) => sub.is_active)
        .map((sub: any) => ({
          uuid: sub.uuid,
          category_name: sub.sub_category_name,
          category_slug: sub.sub_category_slug,
          thumbnail_img: sub.thumbnail_img,
          is_featured: sub.is_featured,
          is_active: sub.is_active,
          child: [],
        }));
      return { apiCategories, apiSubCategories };
    }
    return { apiCategories: [], apiSubCategories: [] };
  } catch (err) {
    console.error("[Header] categories/child fetch failed:", err);
    return { apiCategories: [], apiSubCategories: [] };
  }
}

async function fetchBrands(): Promise<{ apiBrands: any; apiSubBrands: any }> {
  try {
    const response = await api.get<ApiResponse>("/categories/brands", {
      next: { revalidate: 300 },
    });

    if (response?.data) {
      const cats = Array.isArray(response.data.category) ? response.data.category : [];
      const subCats = Array.isArray(response.data.subCategory) ? response.data.subCategory : [];

      const apiBrands = cats
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          child: (cat.child ?? []).filter((brand) => brand.is_active),
        }));

      const apiSubBrands = subCats
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
      return { apiBrands, apiSubBrands };
    }
    return { apiBrands: [], apiSubBrands: [] };
  } catch (err) {
    console.error("[Header] categories/brands fetch failed:", err);
    return { apiBrands: [], apiSubBrands: [] };
  }
}

// ─── Main Header (Server Component) ──────────────────────────────────────────
export default async function Header() {
  const [
    { apiCategories, apiSubCategories },
    { apiBrands, apiSubBrands },
  ] = await Promise.all([fetchCategories(), fetchBrands()]);

  const explorAllData = [...apiBrands, ...apiSubBrands]


  return (
    <header
      className="w-full font-sans relative transition-colors duration-300  rounded-b-[20px] lg:px-4 lg:pt-0! py-1 dark:bg-[#1a1a1a] dark:text-white"
      style={{
        backgroundImage: `url(${BgImages.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <TopBar />
      <MainNav />
      <CategoryNav categories={apiCategories} subCategories={apiSubCategories} explorAllData={explorAllData} />
      <MobileHeader categories={[...apiBrands, ...apiSubBrands]} />
    </header>
  );
}
