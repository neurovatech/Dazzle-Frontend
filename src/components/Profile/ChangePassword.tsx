"use client";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { ChangePasswordSchema, changePasswordSchema } from "@/schemas/changePasswordSchema";
import PasswordInput from "../ui/PasswordInput";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChangePasswordResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: { updatedAt: string };
  errors?: string[];
}

interface PropsType {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ChangePassword = ({ setShowOtp }: PropsType) => {
  const token  = useAppSelector((state) => state.auth.token);
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const [successMsg, setSuccessMsg] = useState("");

  const authHeader = token
    ? token.startsWith("Bearer ") ? token : `Bearer ${token}`
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
  } = useForm<ChangePasswordSchema>({
    resolver: yupResolver(changePasswordSchema),
    mode: "onTouched",
  });

  // Live password strength
  const newPasswordValue = watch("newPassword", "");

  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: "", color: "", width: "w-0" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;
    if (score <= 2) return { label: "Weak",   color: "bg-red-400",    width: "w-1/3" };
    if (score <= 4) return { label: "Fair",   color: "bg-yellow-400", width: "w-2/3" };
    return              { label: "Strong", color: "bg-green-500",  width: "w-full" };
  };

  const strength = getPasswordStrength(newPasswordValue);

  // ── Mutation ──
  const { mutate, isPending } = useMutation<ChangePasswordResponse, Error, ChangePasswordSchema>({
    mutationFn: (formData) =>
      api.post<ChangePasswordResponse>("change-password", {
        newPassword: formData.newPassword,
        rePassword:  formData.rePassword,
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key":     apiKey || "",
          Authorization:   authHeader,
        },
      }),

    onSuccess: (res) => {
      if (res.statusCode === 200) {
        setSuccessMsg(res.message || "Password changed successfully.");
        reset();
        // OTP step-এ যেতে চাইলে uncomment করো:
        // setShowOtp(true);
      } else if (res.errors?.length) {
        mapApiErrors(res.errors);
      } else {
        setError("rePassword", { type: "server", message: res.message });
      }
    },

    onError: (err) => {
      setSuccessMsg("");
      try {
        const parsed = JSON.parse(err.message) as ChangePasswordResponse;
        if (parsed.errors?.length) {
          mapApiErrors(parsed.errors);
        } else {
          setError("rePassword", { type: "server", message: parsed.message || "Something went wrong." });
        }
      } catch {
        setError("rePassword", { type: "server", message: "Something went wrong. Please try again." });
      }
    },
  });

  // Map backend field error messages → correct form fields
  const mapApiErrors = (apiErrors: string[]) => {
    apiErrors.forEach((msg) => {
      const lower = msg.toLowerCase();
      if (lower.includes("new-password")) {
        setError("newPassword", { type: "server", message: msg });
      } else if (lower.includes("re-password")) {
        setError("rePassword", { type: "server", message: msg });
      } else {
        setError("rePassword", { type: "server", message: msg });
      }
    });
  };

  const onSubmit: SubmitHandler<ChangePasswordSchema> = (data) => {
    setSuccessMsg("");
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 w-full md:w-3/5 pt-3"
    >
      {/* New Password */}
      <div className="flex flex-col gap-1.5">
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          error={errors.newPassword?.message}
          register={register("newPassword")}
        />

        {/* Strength bar */}
        {newPasswordValue && (
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                strength.label === "Weak"   ? "text-red-400"    :
                strength.label === "Fair"   ? "text-yellow-500" :
                                              "text-green-500"
              }`}
            >
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <PasswordInput
        label="Confirm Password"
        placeholder="Re-enter new password"
        error={errors.rePassword?.message}
        register={register("rePassword")}
      />

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 size={16} className="shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Submit */}
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
            Submitting...
          </span>
        ) : (
          "Change Password"
        )}
      </button>
    </form>
  );
};

export default ChangePassword;
