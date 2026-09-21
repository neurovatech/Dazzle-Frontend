"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import {
  startGoogleLogin,
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
    Authorization?: string;
    authorization?: string;
    /** Set by /login-with-google: true when this sign-in just created the account. */
    isNewUser?: boolean;
  };
  errors?: string[];
}

function socialLogin(payload: { provider: "facebook"; accessToken: string }) {
  return api.post<SocialLoginResponse>("social-login", payload);
}

/**
 * Exchanges the authorization code Google sent to /signin-google. The backend
 * requires the X-Requested-With header and the SAME redirectUri that was used
 * to start the login. `login-with-google` is listed as an auth endpoint in
 * api.ts, so a wrong/expired code (401) is reported as a login error instead
 * of being mistaken for an expired session.
 */
function googleLogin(payload: { code: string; redirectUri: string }) {
  return api.post<SocialLoginResponse>("login-with-google", payload, {
    headers: { "X-Requested-With": "XmlHttpRequest" },
  });
}

export function useSocialAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | null>(null);

  /** Returns true once the visitor is logged in and being redirected. */
  const finishLogin = (response: SocialLoginResponse, redirectTo?: string): boolean => {
    if (response.statusCode !== 200 || response.status !== "success" || !response.data) {
      toast.error(response.message || "Social login failed.");
      return false;
    }

    const authHeader = response.data.Authorization || response.data.authorization || "";
    const apiKey = response.data["x-api-key"];
    if (!authHeader || !apiKey) {
      toast.error("Login failed: the server didn't return a session.");
      return false;
    }

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

    toast.success(response.data.isNewUser ? "Account created. Welcome!" : "Logged in successfully!");
    const redirectUrl =
      redirectTo ?? new URLSearchParams(window.location.search).get("redirect");
    router.push(redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//") ? redirectUrl : "/");
    return true;
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

  /** Step 1: send the browser to Google. The spinner stays until the page unloads. */
  const loginWithGoogle = () => {
    if (!isGoogleLoginConfigured()) {
      toast.error("Google login isn't configured yet.");
      return;
    }
    setLoadingProvider("google");
    try {
      startGoogleLogin(new URLSearchParams(window.location.search).get("redirect"));
    } catch (err) {
      setLoadingProvider(null);
      handleError(err);
    }
  };

  /** Step 2 (on /signin-google): trade the code Google returned for a session. */
  const completeGoogleLogin = async (
    code: string,
    redirectUri: string,
    returnTo: string,
  ): Promise<boolean> => {
    try {
      const response = await googleLogin({ code, redirectUri });
      return finishLogin(response, returnTo);
    } catch (err) {
      handleError(err);
      return false;
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
    completeGoogleLogin,
    loginWithFacebook,
    isGoogleLoading: loadingProvider === "google",
    isFacebookLoading: loadingProvider === "facebook",
  };
}
