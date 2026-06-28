import CategoriesCard from "./CategoriesCard";
import { api } from "@/lib/api";

export default async function CategoriesSection() {
  let categories: {
    uuid: string;
    category_name: string;
    category_slug: string;
    thumbnail_img: string;
  }[] = [];

  try {
    const res = await api.get<unknown>("/categories?limit=8", { cache: "no-store" });
    let list: unknown[] = [];
    if (Array.isArray(res)) {
      list = res;
    } else {
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj?.data)) {
        list = obj.data;
      }
    }
    categories = list.slice(0, 8).map((item) => {
      const c = item as Record<string, unknown>;
      return {
        uuid: String(c.uuid ?? ""),
        category_name: String(c.category_name ?? ""),
        category_slug: String(c.category_slug ?? ""),
        thumbnail_img: c.thumbnail_img ? String(c.thumbnail_img) : "",
      };
    });
  } catch (error) {
    console.error("Error fetching categories in CategoriesSection SSR:", error);
  }

  return <CategoriesCard categories={categories} seeAllBtn={true} />;
}
