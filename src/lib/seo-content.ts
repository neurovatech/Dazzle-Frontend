import { cache } from "react";
import { api } from "@/lib/api";

/**
 * Shape returned by the /seo/* family: /seo/brand/{slug},
 * /seo/category/{slug}, /seo/subcategory/{slug}.
 */
export interface SeoContentResponse {
  statusCode: number;
  status: string;
  found: boolean;
  message?: string;
  data?: {
    title?: string;
    keywords?: string;
    canonical?: string;
    /** Long-form marketing copy, raw HTML from the CMS. */
    bottomContent?: string;
    description?: string;
  };
}

export type SeoContent = NonNullable<SeoContentResponse["data"]>;

/**
 * Fetch CMS SEO copy for one entity.
 *
 * cache() matters here: generateMetadata and the page body both need this, and
 * without it every render would hit the endpoint twice for the same slug.
 *
 * A 404 is a normal answer, not a fault — the endpoints reply
 * `{ found: false, message: "Category not found." }` for slugs the CMS does not
 * know, and api.get throws on that status. Callers get null and fall back to
 * their own generated copy.
 */
const fetchSeoContent = cache(
  async (kind: "brand" | "category" | "subcategory", slug: string) => {
    if (!slug?.trim()) return null;
    try {
      const res = await api.get<SeoContentResponse>(
        `/seo/${kind}/${encodeURIComponent(slug)}`,
        { next: { revalidate: 300 } } as RequestInit,
      );
      return res?.data ?? null;
    } catch {
      return null;
    }
  },
);

export const getBrandSeoContent = (slug: string) =>
  fetchSeoContent("brand", slug);
export const getCategorySeoContent = (slug: string) =>
  fetchSeoContent("category", slug);
export const getSubCategorySeoContent = (slug: string) =>
  fetchSeoContent("subcategory", slug);

/**
 * Rich text that would render as a blank block.
 *
 * `.trim()` is not enough. Every category currently answers 200/found:true with
 * bottomContent exactly `"<p><br></p>"` — eleven characters that pass a truthy
 * check and then paint an empty bordered box on the page. So strip the tags and
 * the entities before deciding whether there is anything to show.
 */
export function hasRichText(html?: string | null): boolean {
  if (!html) return false;
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/\s+/g, "")
      .length > 0
  );
}

/** Non-empty trimmed string, or undefined — for `apiValue || fallback` chains. */
export function seoText(value?: string | null): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

/**
 * Tailwind classes for a CMS rich-text block.
 *
 * Shared so the brand, category and subcategory pages render identical copy
 * identically, and so the CMS's inline Google-Docs styling is overridden in one
 * place rather than three.
 */
export const SEO_RICH_TEXT_CLASS = `text-sm leading-relaxed text-[#222] dark:text-white
  [&_h1]:text-[#222] [&_h1]:dark:text-white [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mt-6 [&_h1]:mb-3
  [&_h2]:text-[#222] [&_h2]:dark:text-white [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3
  [&_h3]:text-[#222] [&_h3]:dark:text-white [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-5 [&_h3]:mb-2
  [&_h4]:text-[#222] [&_h4]:dark:text-white [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
  [&_p]:text-[#222] [&_p]:dark:text-gray-300 [&_p]:mb-3
  [&_li]:text-[#222] [&_li]:dark:text-gray-300 [&_li]:mb-1
  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
  [&_span]:text-[#222] [&_span]:dark:text-gray-300!
  [&_strong]:text-[#222] [&_strong]:dark:text-white
  [&_a]:text-[#CB843B] [&_a]:underline
  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
  [&_table]:w-full [&_table]:border [&_table]:border-gray-200 [&_table]:dark:border-[#4a443f]
  [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-[#4a443f] [&_td]:p-2
  [&_td]:text-[#222] [&_td]:dark:text-gray-300`;
