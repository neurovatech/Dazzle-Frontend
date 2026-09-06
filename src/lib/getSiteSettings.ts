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
  // ── Analytics codes from CMS ──────────────────────────────────
  facebookBaseCode?: string;
  googleGTMCode?: string;
  googleAnalyticsCode?: string;
  tikTokBaseCode?: string;
}

// strip inline-styled HTML down to plain, meta-tag-safe text
export function stripHtml(html?: string, maxLen = 160): string {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

/**
 * Fields that are enormous rich-text/HTML blobs and are only ever needed by one
 * specific page (or only on the server).
 *
 * Measured against the live API, the full site-settings object is ~783 KB:
 *   metaDescription    568 KB  — only used server-side, and truncated to 160
 *                                chars for the <meta> tag; the client never
 *                                reads the raw value
 *   aboutUs            163 KB  — only /about-us renders it
 *   termsAndCondition   47 KB  — only /terms-conditions renders it
 *
 * Shipping all of that to the browser on EVERY page made the homepage's RSC
 * payload ~1.1 MB, of which ~800 KB was this content — which cost ~1.6s of
 * script evaluation on mobile and was a large share of Total Blocking Time.
 *
 * stripHeavyFields() produces the version safe to hand to the client. The two
 * pages that genuinely need the long-form HTML fetch it themselves via
 * useSiteSettingsFull().
 */
const HEAVY_FIELDS = [
  "metaDescription",
  "metaKeywords",
  "aboutUs",
  "termsAndCondition",
  "faq",
] as const;

export type ClientSiteSettings = Omit<SiteSettings, (typeof HEAVY_FIELDS)[number]>;

export function stripHeavyFields(settings: SiteSettings): ClientSiteSettings {
  const lite: Record<string, unknown> = { ...settings };
  for (const f of HEAVY_FIELDS) delete lite[f];
  return lite as ClientSiteSettings;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const res = await api.get<{ data: SiteSettings }>("/site-settings", {
      next: { revalidate: 5 },
    });
    return res.data ?? {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/not found/i.test(message)) {
      console.error("Error fetching site settings:", error);
    }
    return {};
  }
});