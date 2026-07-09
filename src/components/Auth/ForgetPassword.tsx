"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";

import { forgetPasswordSchema, ForgetPasswordSchema } from "@/schemas/forgetPasswordSchema";
import TextInput from "@/components/ui/TextInput";
import { FacebookIcon, GoogleIcon, InstragramIcon } from "@/icon";
import { api } from "@/lib/api";

// ─── API Types ────────────────────────────────────────────────────────────────
interface RecoveryPayload {
  email: string;
}

interface RecoveryResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  errors?: string[];
}

// ─── API Function ─────────────────────────────────────────────────────────────
async function recoverPassword(payload: RecoveryPayload): Promise<RecoveryResponse> {
  return api.post<RecoveryResponse>("password-recovery", payload);
}

// ─── Component ────────────────────────────────────────────────────────────────
const ForgetPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ForgetPasswordSchema>({
    resolver: yupResolver(forgetPasswordSchema) as never,
    mode: "onTouched",
  });

  // ─── Mutation ─────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: recoverPassword,
    onSuccess: (response) => {
      if (response.statusCode === 200 && response.status === "success") {
        toast.success(response.message || "Password recovery email sent successfully!");
        reset();
      } else {
        toast.error(response.message || "Failed to submit request.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as RecoveryResponse;

          if (parsed.errors && parsed.errors.length > 0) {
            parsed.errors.forEach((err) => toast.error(err));
            parsed.errors.forEach((err) => {
              if (err.toLowerCase().includes("email")) {
                setError("email", { message: err });
              }
            });
          } else {
            toast.error(parsed.message || "Password recovery failed.");
            if (parsed.statusCode === 429) {
              // Rate limit message shown directly
              toast.error(parsed.message);
            }
          }
        } catch {
          toast.error(error.message || "Something went wrong. Please try again.");
        }
      } else {
        toast.error("Failed to connect to authentication servers.");
      }
    },
  });

  const onSubmit: SubmitHandler<ForgetPasswordSchema> = (data) => {
    mutate({ email: data.email });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <TextInput
        label="Email Address"
        placeholder="Enter your email address"
        error={errors.email?.message}
        register={register("email")}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2 dark:text-white">
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
            Sending Recovery Link...
          </span>
        ) : (
          "RECOVER PASSWORD"
        )}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-white">
        Remembered your password?{" "}
        <Link
          href="/auth/login"
          className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
        >
          Log In
        </Link>
      </p>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 dark:text-white">Or</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#222222DB] hover:bg-[#222222DB]/70 flex items-center justify-center transition-colors duration-200 shadow-sm"
          >
            <GoogleIcon />
          </button>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#222222DB] hover:bg-[#222222DB]/70 flex items-center justify-center transition-colors duration-200 shadow-sm"
          >
            <FacebookIcon />
          </button>

          {/* <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#222222DB] hover:bg-[#222222DB]/70 flex items-center justify-center transition-colors duration-200 shadow-sm"
          >
            <InstragramIcon />
          </button> */}
        </div>
      </div>
    </form>
  );
};

export default ForgetPassword;
