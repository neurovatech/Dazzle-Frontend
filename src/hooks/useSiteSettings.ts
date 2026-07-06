"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSiteSettings, SiteSettingsData } from "@/store/slices/siteSettingsSlice";
import { api } from "@/lib/api";

interface SiteSettingsResponse {
  data: SiteSettingsData;
}


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
      return res.data;
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
