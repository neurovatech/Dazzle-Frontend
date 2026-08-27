/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { api } from "@/lib/api";

/**
 * Resolves a category / sub-category slug to its REAL display name from the API.
 *
 * Why this exists: category pages previously built their metadata by title-casing
 * the URL slug (`tv-home-appliance` -> "Tv Home Appliance"), which cannot
 * reproduce the editor-authored name ("TV & Home Appliance"). Titles and H1s are
 * primary ranking and click signals, so they must reflect the API's real value.
 *
 * Wrapped in React's `cache()` so `generateMetadata` and the page component share
 * one request per render pass.
 */

export interface CategoryLookup {
  categoryName?: string;
  subCategoryName?: string;
  /**
   * Category / sub-category artwork, used as the social-share (og:image) photo
   * so a shared category link previews with a real image instead of the tiny
   * site wordmark. Undefined when the API has no thumbnail for that entry.
   */
  categoryImage?: string;
  subCategoryImage?: string;
}

const getCategoryTree = cache(async (): Promise<any[]> => {
  try {
    const res = await api.get<any>("/categories/child", {
      next: { revalidate: 300 },
    });
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
});

/** Fallback used when the API has no matching entry — same behaviour as before. */
export function toTitleCase(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const lookupCategoryNames = cache(
  async (categorySlug: string, subCategorySlug?: string): Promise<CategoryLookup> => {
    const tree = await getCategoryTree();

    const cat = tree.find(
      (c: any) => c?.category_slug === decodeURIComponent(categorySlug),
    );

    // Always fall back to the slug-derived name so a failed/empty API response
    // degrades to exactly the previous behaviour rather than an empty title.
    const categoryName = cat?.category_name || toTitleCase(categorySlug);
    const categoryImage = cat?.thumbnail_img || undefined;

    if (!subCategorySlug) return { categoryName, categoryImage };

    const sub = (cat?.child ?? []).find(
      (s: any) => s?.sub_category_slug === decodeURIComponent(subCategorySlug),
    );

    return {
      categoryName,
      categoryImage,
      subCategoryName: sub?.sub_category_name || toTitleCase(subCategorySlug),
      subCategoryImage: sub?.thumbnail_img || undefined,
    };
  },
);
