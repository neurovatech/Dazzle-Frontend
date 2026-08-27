"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSiteSettings, SiteSettingsData } from "@/store/slices/siteSettingsSlice";
import { api } from "@/lib/api";

interface SiteSettingsResponse {
  data: SiteSettingsData;
}

/**
 * Site settings for general UI (header, footer, contact info, social links).
 *
 * Returns the LITE object: the huge rich-text fields (metaDescription ~568 KB,
 * aboutUs ~163 KB, termsAndCondition ~47 KB) are stripped before this ever
 * reaches the browser, because no header/footer consumer reads them. The server
 * dehydrates the same stripped shape in the root layout, so this hook usually
 * resolves instantly from that cache without a network request at all.
 *
 * If you need the long-form HTML, use useSiteSettingsFull() instead — it is
 * deliberately a separate query so that weight is only paid on the one or two
 * pages that actually render it.
 */
export function useSiteSettings() {
  const dispatch = useAppDispatch();
  const siteSettings = useAppSelector((state) => state.siteSettings.data);
  const isFetched = useAppSelector((state) => state.siteSettings.isFetched);

  const query = useQuery<SiteSettingsData, Error>({
    queryKey: ["siteSettings"],
    enabled: !isFetched,
    staleTime: 30 * 60 * 1000, // 30 min
    queryFn: async () => {
      const res = await api.get<SiteSettingsResponse>("site-settings");
      // Strip client-side too: this path runs only when the dehydrated cache
      // was missed, and without it the heavy fields would land in Redux (and,
      // via redux-persist, in localStorage).
      const { metaDescription, metaKeywords, aboutUs, termsAndCondition, faq, ...lite } =
        res.data ?? ({} as SiteSettingsData);
      void metaDescription;
      void metaKeywords;
      void aboutUs;
      void termsAndCondition;
      void faq;
      return lite as SiteSettingsData;
    },
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setSiteSettings(query.data));
    }
  }, [query.data, dispatch]);

  return {
    data: siteSettings ?? query.data ?? null,
    isLoading: query.isLoading && !siteSettings,
  };
}

/**
 * Full site settings, including the long-form HTML fields.
 *
 * Only for pages that actually render that content (/about-us,
 * /terms-conditions). Kept on a separate query key so the payload is never
 * shared with — or cached alongside — the lightweight sitewide settings, and
 * is never written into the persisted Redux store.
 */
export function useSiteSettingsFull() {
  const query = useQuery<SiteSettingsData, Error>({
    queryKey: ["siteSettingsFull"],
    staleTime: 30 * 60 * 1000, // 30 min
    queryFn: async () => {
      const res = await api.get<SiteSettingsResponse>("site-settings");
      return res.data;
    },
  });

  return { data: query.data ?? null, isLoading: query.isLoading };
}
