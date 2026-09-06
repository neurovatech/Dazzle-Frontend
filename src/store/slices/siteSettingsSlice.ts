import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettingsData {
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

export interface SiteSettingsState {
  data: SiteSettingsData | null;
  isFetched: boolean;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SiteSettingsState = {
  data: null,
  isFetched: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const siteSettingsSlice = createSlice({
  name: "siteSettings",
  initialState,
  reducers: {
    setSiteSettings(state, action: PayloadAction<SiteSettingsData>) {
      state.data = action.payload;
      state.isFetched = true;
    },
    clearSiteSettings(state) {
      state.data = null;
      state.isFetched = false;
    },
  },
});

export const { setSiteSettings, clearSiteSettings } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
