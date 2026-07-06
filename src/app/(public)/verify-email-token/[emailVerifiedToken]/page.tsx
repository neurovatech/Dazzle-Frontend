/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { MailCheck, ShieldAlert, Loader2, Home, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setEmailVerified } from "@/store/slices/authSlice";

// ─── API Types ────────────────────────────────────────────────────────────────
interface VerifySuccessData {
  "x-api-key": string;
  authorization: string;
}

interface VerifyResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: VerifySuccessData;
  errors?: string[];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasCalled = useRef(false);

  const [status, setStatus] = useState<"verifying" | "success" | "already-verified" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  const emailVerifiedToken = params?.emailVerifiedToken as string;

  // ─── API Mutation ───────────────────────────────────────────────────────────
  const { mutate } = useMutation<VerifyResponse, Error, string>({
    mutationFn: async (token) => {
      return api.get<VerifyResponse>(`verify-email-token/${token}`);
    },
    onSuccess: (response) => {
      if (response.statusCode === 200) {
        if (response.message === "Email already verified.") {
          setStatus("already-verified");
          toast.success("Email is already verified!");
        } else {
          // Newly verified, update Redux credentials
          if (response.data) {
            dispatch(
              setEmailVerified({
                apiKey: response.data["x-api-key"],
                token: response.data.authorization, // contains Bearer token
              })
            );
          }
          setStatus("success");
          toast.success("Email verified successfully!");
        }
        startRedirectCountdown();
      } else {
        setStatus("error");
        setErrorMessage(response.message || "Failed to verify email token.");
      }
    },
    onError: (error: any) => {
      setStatus("error");
      try {
        // Try parsing JSON error
        const parsed = JSON.parse(error.message) as VerifyResponse;
        if (parsed.errors && parsed.errors.length > 0) {
          setErrorMessage(parsed.errors[0]);
        } else {
          setErrorMessage(parsed.message || "Failed to verify email token.");
        }
      } catch {
        setErrorMessage(error.message || "An unexpected error occurred.");
      }
    },
  });

  // ─── Trigger API on Mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (emailVerifiedToken && !hasCalled.current) {
      hasCalled.current = true;
      mutate(emailVerifiedToken);
    }
  }, [emailVerifiedToken, mutate]);

  // ─── Countdown Redirect ─────────────────────────────────────────────────────
  const startRedirectCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gray-50 dark:bg-[#12100E] font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1917] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Colorful gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Status: VERIFYING */}
          {status === "verifying" && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6 mx-auto">
                <Loader2 size={36} className="text-orange-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Link
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Checking your verification token with our servers. Please wait a moment...
              </p>
            </div>
          )}

          {/* Status: SUCCESS */}
          {status === "success" && (
            <div className="animate-in fade-in zoom-in duration-300 w-full">
              <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-6 mx-auto">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Your email address has been successfully verified. Welcome to Dazzle Commerce!
              </p>
              
              <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-4 mb-6">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  Redirecting to home page in <strong className="text-sm">{countdown}</strong> seconds...
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Go to Home Now
              </button>
            </div>
          )}

          {/* Status: ALREADY VERIFIED */}
          {status === "already-verified" && (
            <div className="animate-in fade-in zoom-in duration-300 w-full">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 mx-auto">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <MailCheck size={32} className="text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Already Verified
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Your email is already verified. There is no further action required.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4 mb-6">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  Redirecting to home page in <strong className="text-sm">{countdown}</strong> seconds...
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Go to Home Now
              </button>
            </div>
          )}

          {/* Status: ERROR */}
          {status === "error" && (
            <div className="animate-in fade-in zoom-in duration-300 w-full">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <ShieldAlert size={32} className="text-red-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed font-semibold mb-4">
                {errorMessage}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                The link you followed may be invalid, expired, or already used. Please request a new verification link.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/auth/registration"
                  className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-100 transition-all duration-200 text-center"
                >
                  Register Again
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <Home size={15} />
                  Return Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
