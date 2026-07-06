import { cache } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  siteLogo?: string;
  footerLogo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  footerText?: string;
  copyrightText?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  currencyName?: string;
  aboutUs?: string;
  termsAndCondition?: string;
  faq?: { question: string; answer: string }[];
}

// strip inline-styled HTML down to plain, meta-tag-safe text
export function stripHtml(html?: string, maxLen = 160): string {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const res = await api.get<{ data: SiteSettings }>("/site-settings", {
      cache: "no-store",
    });
    // console.log("Fetched site settings:", res.data);
    return res.data ?? {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/not found/i.test(message)) {
      console.error("Error fetching site settings:", error);
    }
    return {};
  }
});