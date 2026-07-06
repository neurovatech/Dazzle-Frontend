"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnsubscribeResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: {
    newsletterUuid: string;
    email: string;
    isSubscribed: boolean;
    unsubscribedAt: string;
    updatedAt: string;
  };
  errors?: string[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [successData, setSuccessData] = useState<UnsubscribeResponse["data"] | null>(null);

  const { mutate: unsubscribe, isPending } = useMutation<
    UnsubscribeResponse,
    Error,
    string
  >({
    mutationFn: (unsubscribeToken) =>
      api.post<UnsubscribeResponse>("newsletter-unsubscribe", {
        unsubscribeToken,
      }),
    onSuccess: (res) => {
      setApiErrors([]);
      if (res.statusCode === 200 && res.data) {
        setSuccessData(res.data);
      } else if (res.errors?.length) {
        setApiErrors(res.errors);
      } else {
        setApiErrors([res.message]);
      }
    },
    onError: (err) => {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.errors?.length) {
          setApiErrors(parsed.errors);
        } else {
          setApiErrors([parsed.message || "Something went wrong."]);
        }
      } catch {
        setApiErrors(["Something went wrong."]);
      }
    },
  });

  // Auto-trigger when token is present in URL
  useEffect(() => {
    if (token) {
      unsubscribe(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1c1917] rounded-2xl shadow-2xl overflow-hidden">
          {/* Top gradient stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />


          <div className="px-8 py-10 text-center space-y-5">
            {/* ── Loading ── */}
            {isPending && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-[#6D3F0E] dark:text-[#d4a97a]" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Processing...
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we unsubscribe you.
                </p>
              </>
            )}

            {/* ── Success ── */}
            {!isPending && successData && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-[#00AE51]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Unsubscribed Successfully
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {successData.email}
                  </span>{" "}
                  has been removed from our newsletter list. You will no longer
                  receive emails from us.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Changed your mind?{" "}
                  <Link
                    href="/"
                    className="text-[#6D3F0E] dark:text-[#d4a97a] font-semibold hover:underline"
                  >
                    Resubscribe from our website
                  </Link>
                </p>
              </>
            )}

            {/* ── No token in URL ── */}
            {!isPending && !successData && !token && apiErrors.length === 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <MailX size={28} className="text-gray-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Invalid Link
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  This unsubscribe link is invalid or has already been used.
                  Please use the link directly from your newsletter email.
                </p>
              </>
            )}

            {/* ── Errors ── */}
            {!isPending && apiErrors.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <XCircle size={32} className="text-red-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Something Went Wrong
                </h2>
                <ul className="space-y-1">
                  {apiErrors.map((err, i) => (
                    <li key={i} className="text-sm text-red-500 dark:text-red-400">
                      {err}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ── Back to home ── */}
            {!isPending && (
              <Link
                href="/"
                className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[#6D3F0E] hover:bg-[#5a3409] text-white text-sm font-semibold transition-colors"
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
