"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import {
  getGoogleAccessToken,
  getFacebookAccessToken,
  isGoogleLoginConfigured,
  isFacebookLoginConfigured,
} from "@/lib/socialAuth";

/**
 * One backend endpoint covers both login AND signup for a social account —
 * there's no separate "register with Google" step for the backend to build,
 * since the provider has already verified the person's identity. The
 * response is expected to match /user-login's shape exactly (same
 * x-api-key/Authorization fields) so this reuses setCredentials unchanged.
 * See docs/social-login-backend-requirements.txt for the endpoint contract.
 */
interface SocialLoginResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: {
    usersCommuuid?: string;
    userFullName?: string;
    email?: string;
    emailVerifiedToken?: string;
    createdAt?: string;
    "x-api-key": string;
    Authorization: string;
    authorization?: string;
  };
  errors?: string[];
}

function socialLogin(payload: { provider: "google" | "facebook"; accessToken: string }) {
  return api.post<SocialLoginResponse>("social-login", payload);
}

export function useSocialAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | null>(null);

  const finishLogin = (response: SocialLoginResponse) => {
    if (response.statusCode !== 200 || response.status !== "success" || !response.data) {
      toast.error(response.message || "Social login failed.");
      return;
    }

    const authHeader = response.data.Authorization || response.data.authorization || "";
    const apiKey = response.data["x-api-key"];

    if (typeof window !== "undefined") {
      localStorage.setItem("token", authHeader);
      localStorage.setItem("apiKey", apiKey);
    }

    dispatch(
      setCredentials({
        user: {
          usersCommuuid: response.data.usersCommuuid || "",
          userFullName: response.data.userFullName || "",
          email: response.data.email || "",
          emailVerifiedToken: response.data.emailVerifiedToken || "",
          createdAt: response.data.createdAt || new Date().toISOString(),
        },
        apiKey,
        token: authHeader,
      }),
    );

    toast.success("Logged in successfully!");
    const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
    router.push(redirectUrl || "/");
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message) as SocialLoginResponse;
        if (parsed.errors?.length) parsed.errors.forEach((e) => toast.error(e));
        else toast.error(parsed.message || "Social login failed.");
      } catch {
        toast.error(err.message || "Social login failed.");
      }
    } else {
      toast.error("Social login failed.");
    }
  };

  const loginWithGoogle = async () => {
    if (!isGoogleLoginConfigured()) {
      toast.error("Google login isn't configured yet.");
      return;
    }
    setLoadingProvider("google");
    try {
      const accessToken = await getGoogleAccessToken();
      const response = await socialLogin({ provider: "google", accessToken });
      finishLogin(response);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const loginWithFacebook = async () => {
    if (!isFacebookLoginConfigured()) {
      toast.error("Facebook login isn't configured yet.");
      return;
    }
    setLoadingProvider("facebook");
    try {
      const accessToken = await getFacebookAccessToken();
      const response = await socialLogin({ provider: "facebook", accessToken });
      finishLogin(response);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return {
    loginWithGoogle,
    loginWithFacebook,
    isGoogleLoading: loadingProvider === "google",
    isFacebookLoading: loadingProvider === "facebook",
  };
}
