"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";

import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/schemas/resetPasswordSchema";
import PasswordInput from "@/components/ui/PasswordInput";
import { api } from "@/lib/api";

// ─── API Types ────────────────────────────────────────────────────────────────
interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
  rePassword: string;
}

interface ResetPasswordResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  errors?: string[];
}

// ─── API Function ─────────────────────────────────────────────────────────────
async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  return api.post<ResetPasswordResponse>("reset-password-token", payload);
}

// ─── Password Strength Helper ─────────────────────────────────────────────────
function getPasswordStrength(
  pwd: string
): { label: string; color: string; width: string } {
  if (!pwd) return { label: "", color: "", width: "w-0" };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[@$!%*?&#]/.test(pwd)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-400", width: "w-1/3" };
  if (score <= 4) return { label: "Fair", color: "bg-yellow-400", width: "w-2/3" };
  return { label: "Strong", color: "bg-green-500", width: "w-full" };
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const resetToken = params?.resetToken as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
  } = useForm<ResetPasswordSchema>({
    resolver: yupResolver(resetPasswordSchema) as never,
    mode: "onTouched",
  });

  const passwordValue = watch("newPassword", "");
  const strength = getPasswordStrength(passwordValue);

  // ─── Mutation ───────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      if (response.statusCode === 200 && response.status === "success") {
        reset();
        setSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as ResetPasswordResponse;
          if (parsed.errors && parsed.errors.length > 0) {
            parsed.errors.forEach((err) => toast.error(err));
            parsed.errors.forEach((err) => {
              const e = err.toLowerCase();
              if (e.includes("newpassword") || e.includes("new password")) {
                setError("newPassword", { message: err });
              }
              if (e.includes("repassword") || e.includes("match")) {
                setError("rePassword", { message: err });
              }
            });
          } else {
            toast.error(parsed.message || "Password reset failed.");
          }
        } catch {
          toast.error(error.message || "Something went wrong. Please try again.");
        }
      } else {
        toast.error("Failed to connect to authentication servers.");
      }
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = (data) => {
    if (!resetToken) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }
    mutate({
      resetToken,
      newPassword: data.newPassword,
      rePassword: data.rePassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-[#12100E]">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white dark:bg-[#1c1917] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {/* Gradient top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

          <div className="px-8 py-8">

            {/* ── SUCCESS STATE ── */}
            {success ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Password Reset!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Your password has been successfully updated. You can now log in
                  with your new password.
                </p>
                <Link
                  href="/auth/login"
                  className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-100 transition-all duration-200 text-center block"
                >
                  Go to Login
                </Link>
              </div>

            ) : (

              /* ── FORM STATE ── */
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                    <KeyRound size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Reset Password
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Enter a strong new password below
                    </p>
                  </div>
                </div>

                {/* Token info badge */}
                {resetToken && (
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl px-4 py-3 mb-6 flex items-start gap-2">
                    <ShieldAlert
                      size={15}
                      className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                      You are resetting with a secure token. This link is{" "}
                      <strong>single-use</strong> and will expire after submission.
                    </p>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <PasswordInput
                      label="New Password"
                      placeholder="Enter your new password"
                      error={errors.newPassword?.message}
                      register={register("newPassword")}
                    />
                    {/* Password strength bar */}
                    {passwordValue && (
                      <div className="flex items-center gap-3 px-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            strength.label === "Weak"
                              ? "text-red-400"
                              : strength.label === "Fair"
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        >
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Re-enter your new password"
                    error={errors.rePassword?.message}
                    register={register("rePassword")}
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Resetting Password...
                      </span>
                    ) : (
                      "RESET PASSWORD"
                    )}
                  </button>

                  {/* Back to login */}
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Remember your password?{" "}
                    <Link
                      href="/auth/login"
                      className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
                    >
                      Log In
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
