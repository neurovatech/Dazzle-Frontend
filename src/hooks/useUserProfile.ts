"use client";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setProfileData, clearProfileData, UserProfileData } from "@/store/slices/profileSlice";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
}

export interface UpdateUserInfoPayload {
  userFullName: string;
  mobile: string;
  address?: string;
  userAvatar?: File | null;
}

interface UpdateUserInfoResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: UserProfileData & { address?: string };
  errors?: string[];
}

// ─── Helper: get initials from full name ──────────────────────────────────────

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ─── Hook: fetch + store profile in Redux ─────────────────────────────────────

export function useUserProfile() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const profileData = useAppSelector((state) => state.profile.data);
  const isFetched = useAppSelector((state) => state.profile.isFetched);

  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  const query = useQuery<UserProfileData, Error>({
    queryKey: ["userProfile"],
    enabled: !!token && !!apiKey && !isFetched,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await api.get<UserProfileResponse>("user-profile", {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setProfileData(query.data));
    }
  }, [query.data, dispatch]);

  useEffect(() => {
    if (!token && isFetched) {
      dispatch(clearProfileData());
    }
  }, [token, isFetched, dispatch]);

  return {
    data: profileData,  
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ─── Hook: update user info ────────────────────────────────────────────────────

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const apiKey = useAppSelector((state) => state.auth.apiKey);

  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  return useMutation<UpdateUserInfoResponse, Error, UpdateUserInfoPayload>({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("userFullName", payload.userFullName);
      formData.append("mobile", payload.mobile);
      if (payload.address) formData.append("address", payload.address);
      if (payload.userAvatar) formData.append("userAvatar", payload.userAvatar);

      return api.post<UpdateUserInfoResponse>("user-info-alter", formData, {
        headers: {
          "X-API-Key": apiKey || "",
          Authorization: authHeader,
        },
      });
    },
    onSuccess: (res) => {
      if (res.data) {
        dispatch(setProfileData(res.data));
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
