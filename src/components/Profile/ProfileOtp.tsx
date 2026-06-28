"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { otpSchema, OtpSchema } from "../../schemas/otpSchema";
import OtpInput from "@/components/ui/OtpInput";

const RESEND_COOLDOWN_SECONDS = 60;
const ProfileOtp: React.FC = () => {
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  const {
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<OtpSchema>({
    resolver: yupResolver(otpSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = useCallback(
    (digits: string[]) => {
      setOtpDigits(digits);
      const combined = digits.join("");
      setValue("otp", combined, { shouldValidate: false });
      if (combined.length === 6) {
        clearErrors("otp");
      }
    },
    [setValue, clearErrors],
  );

  const onSubmit: SubmitHandler<OtpSchema> = async (data) => {
    try {
      await new Promise((res) => setTimeout(res, 1200));
    } catch {
      setError("otp", { message: "Invalid OTP. Please try again." });
      setOtpDigits(Array(6).fill(""));
      setValue("otp", "");
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setOtpDigits(Array(6).fill(""));
      setValue("otp", "");
      clearErrors("otp");
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch {
      console.error("Resend failed");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 w-3/5 pt-3"
    >
      {/* Info */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          We sent a OTP at this phone number via message:{" "}
          <span className="font-bold text-gray-900">0124878756575</span>
        </p>

        <p className="text-sm text-gray-500">
          Didnt get any OTP Yet?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend"}
            </button>
          ) : (
            <span className="text-yellow-500 font-semibold">
              Resend in {formatTimer(resendTimer)}
            </span>
          )}
        </p>

        {resendSuccess && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            OTP resent successfully!
          </p>
        )}
      </div>

      <OtpInput
        length={6}
        value={otpDigits}
        onChange={handleOtpChange}
        error={errors.otp?.message}
        isLeft
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
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
            Verifying...
          </span>
        ) : (
          "CHANGE PASSWORD"
        )}
      </button>
    </form>
  );
};

export default ProfileOtp;
