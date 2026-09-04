/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import * as yup from "yup";
import { X, Phone, Shield } from "lucide-react";

import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import TextInput from "@/components/ui/TextInput";
import PasswordInput from "@/components/ui/PasswordInput";
import OtpInput from "@/components/ui/OtpInput";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import SocialLogin from "./SocialLogin";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginPayload {
  username: string;
  password: string;
}
interface LoginSuccessData {
  "x-api-key": string;
  Authorization: string;
  authorization: string;
}
interface LoginResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: LoginSuccessData | {
    username: string;
    "recovery-token": string;
    validity: string;
  };
  errors?: string[];
}

interface OtpSendResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: { mobile: string; tokenType: string; expireAt: string };
  errors?: string[];
}
interface OtpVerifyResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: {
    "x-api-key": string;
    Authorization: string;
    authorization?: string;
    CreatedAt?: string;
    ExpireAt?: string;
  };
  errors?: string[];
}

// ─── Yup Schemas for mobile OTP flow ─────────────────────────────────────────
const mobileSchema = yup.object({
  mobile: yup
    .string()
    .required("Mobile number is required.")
    .matches(/^\d+$/, "Only numbers are allowed — no spaces or special characters.")
    .length(11, "Mobile number must be exactly 11 digits.")
    .matches(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 01700000000)."),
});
type MobileSchema = yup.InferType<typeof mobileSchema>;

const otpVerifySchema = yup.object({
  otp: yup
    .string()
    .required("otp is required.")
    .matches(/^\S+$/, "otp must not contain spaces.")
    .matches(/^\d+$/, "otp must contain numbers only.")
    .matches(/^\d{6}$/, "otp must be 6 digits."),
});

// ─── API Functions ────────────────────────────────────────────────────────────
const loginUser = (p: LoginPayload) => api.post<LoginResponse>("user-login", p);
const sendMobileOtp = (p: { mobile: string }) =>
  api.post<OtpSendResponse>("login-mobile-otp", p);
const verifyMobileOtp = (p: { mobile: string; otp: string }) =>
  api.post<OtpVerifyResponse>("login-with-mobile", p);

// ═════════════════════════════════════════════════════════════════════════════
// Mobile OTP Modal (2-step: phone → otp)
// ═════════════════════════════════════════════════════════════════════════════
interface MobileOtpModalProps {
  onClose: () => void;
}

const RESEND_COOLDOWN = 120;

const MobileOtpModal: React.FC<MobileOtpModalProps> = ({ onClose }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [sentMobile, setSentMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mobileApiError, setMobileApiError] = useState("");
const modalRef = useRef<HTMLDivElement>(null);

  // Mobile form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setMobileError,
  } = useForm<MobileSchema>({
    resolver: yupResolver(mobileSchema) as never,
    mode: "onTouched",
  });

  // ── Countdown timer ────────────────────────────────────────────────────────
  const startTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [onClose]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Send OTP mutation ──────────────────────────────────────────────────────
  const { mutate: sendOtp, isPending: sendingOtp } = useMutation({
    mutationFn: sendMobileOtp,
    onSuccess: (response, variables) => {
      if (response.statusCode === 200) {
        toast.success("OTP sent successfully!");
        setSentMobile(variables.mobile);
        setStep("otp");
        startTimer();
      } else {
        toast.error(response.message || "Failed to send OTP.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as OtpSendResponse;
          if (parsed.errors?.length) {
            parsed.errors.forEach((e) => toast.error(e));
            setMobileApiError(parsed.errors.join(", "));
            parsed.errors.forEach((e) => {
              if (
                e.toLowerCase().includes("mobile") ||
                e.toLowerCase().includes("phone")
              ) {
                setMobileError("mobile", { message: e });
              }
            });
          } else {
            const msg = parsed.message || "Failed to send OTP.";
            toast.error(msg);
            setMobileApiError(msg);
          }
        } catch {
          const msg = error.message || "Something went wrong.";
          toast.error(msg);
          setMobileApiError(msg);
        }
      }
    },
  });

  // ── Verify OTP mutation ────────────────────────────────────────────────────
  const { mutate: verifyOtp, isPending: verifyingOtp } = useMutation({
    mutationFn: verifyMobileOtp,
    onSuccess: (response) => {
      if (response.statusCode === 200 && response.data) {
        toast.success(response.message || "Mobile login completed successfully.");
        const authHeader:any = response.data.Authorization || response.data.authorization;
        const apiKey = response.data["x-api-key"];

        if (typeof window !== "undefined") {
          localStorage.setItem("token", authHeader);
          localStorage.setItem("apiKey", apiKey);
        }

        dispatch(
          setCredentials({
            user: {
              usersCommuuid: "",
              userFullName: "Mobile User",
              email: sentMobile,
              emailVerifiedToken: "",
              createdAt: response.data.CreatedAt || new Date().toISOString(),
            },
            apiKey: apiKey,
            token: authHeader,
          }),
        );
        onClose();
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect");
        router.push(redirectUrl || "/");
      } else {
        toast.error(response.message || "OTP verification failed.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as OtpVerifyResponse;
          if (parsed.errors && parsed.errors.length > 0) {
            parsed.errors.forEach((err) => toast.error(err));
            setOtpError(parsed.errors.join(", "));
          } else {
            const msg = parsed.message || "Invalid OTP.";
            toast.error(msg);
            setOtpError(msg);
          }
        } catch {
          toast.error("OTP verification failed.");
          setOtpError("OTP verification failed.");
        }
      }
      setOtpDigits(Array(6).fill(""));
      setOtpValue("");
    },
  });

  // ── OTP input handler ──────────────────────────────────────────────────────
  const handleOtpChange = useCallback((digits: string[]) => {
    setOtpDigits(digits);
    setOtpValue(digits.join(""));
    if (digits.join("").length === 6) setOtpError("");
  }, []);

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    verifyOtp({ mobile: sentMobile, otp: otpValue });
  };

  const handleResend = () => {
    if (!canResend || sendingOtp) return;
    sendOtp({ mobile: sentMobile });
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
              {step === "mobile" ? (
                <Phone size={17} className="text-yellow-500" />
              ) : (
                <Shield size={17} className="text-yellow-500" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {step === "mobile" ? "Login with Phone" : "Enter OTP"}
              </h2>
              <p className="text-xs text-gray-400">
                {step === "mobile"
                  ? "We'll send a 6-digit code to your number"
                  : `Code sent to ${sentMobile}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-3">
          {/* ── STEP 1: Mobile Input ── */}
          {step === "mobile" && (
            <form
              onSubmit={handleSubmit((data) =>
                sendOtp({ mobile: data.mobile }),
              )}
              noValidate
              className="flex flex-col gap-4"
            >
              <TextInput
                label="Mobile Number"
                placeholder="e.g. 01700000000"
                error={errors.mobile?.message}
                register={{
                  ...register("mobile"),
                  inputMode: "numeric",
                  maxLength: 11,
                  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                    // Allow: backspace, delete, tab, escape, enter, arrow keys
                    const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
                    if (allowed.includes(e.key)) return;
                    // Block anything that is not a digit
                    if (!/^\d$/.test(e.key)) e.preventDefault();
                  },
                  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                    const pasted = e.clipboardData.getData("text");
                    if (!/^\d+$/.test(pasted)) e.preventDefault();
                  },
                }}
              />
              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "SEND OTP"
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Verify ── */}
          {step === "otp" && (
            <form
              onSubmit={handleOtpSubmit}
              noValidate
              className="flex flex-col items-center gap-5"
            >
              {/* Info */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Didn&apos;t get the code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={sendingOtp}
                      className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors disabled:opacity-60"
                    >
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  ) : (
                    <span className="text-yellow-500 font-semibold">
                      Resend in {formatTimer(resendTimer)}
                    </span>
                  )}
                </p>
              </div>

              <OtpInput
                length={6}
                value={otpDigits}
                onChange={handleOtpChange}
                error={otpError}
              />

              <button
                type="submit"
                disabled={verifyingOtp || otpValue.length < 6}
                className="w-full py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "VERIFY & LOG IN"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("mobile");
                  setOtpDigits(Array(6).fill(""));
                  setOtpValue("");
                  setOtpError("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline"
              >
                ← Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Login Form
// ═════════════════════════════════════════════════════════════════════════════
const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showMobileModal, setShowMobileModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<LoginSchema>({
    resolver: yupResolver(loginSchema) as never,
    mode: "onTouched",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (response, variables) => {
      if (response.statusCode === 200 && response.status === "success") {
        toast.success("Login completed successfully!");
        if (response.data && "x-api-key" in response.data) {
          const authHeader =
            response.data.authorization || response.data.Authorization;
          const apiKey = response.data["x-api-key"];

          if (typeof window !== "undefined") {
            localStorage.setItem("token", authHeader);
            localStorage.setItem("apiKey", apiKey);
          }

          dispatch(
            setCredentials({
              user: {
                usersCommuuid: "",
                userFullName: "Verified User",
                email: variables.username,
                emailVerifiedToken: "",
                createdAt: new Date().toISOString(),
              },
              apiKey: apiKey,
              token: authHeader,
            }),
          );
        }
        reset();
        // const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
        // if (redirectUrl) { router.push(redirectUrl); } else { router.back(); }
        const redirectUrl = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
      } else {
        toast.error(response.message || "Failed to log in.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as LoginResponse;

          // ── Password Expired → redirect to reset page ──────────────────
          if (
            parsed.statusCode === 403 &&
            parsed.message === "Password Expired" &&
            parsed.data &&
            "recovery-token" in parsed.data
          ) {
            const token = parsed.data["recovery-token"];
            toast.error("Your password has expired. Please reset it.");
            router.push(`/reset-password-token/${token}?resetType=xreset`);
            return;
          }

          if (parsed.errors?.length) {
            parsed.errors.forEach((err) => toast.error(err));
            parsed.errors.forEach((err) => {
              if (err.toLowerCase().includes("username"))
                setError("username", { message: err });
              if (err.toLowerCase().includes("password"))
                setError("password", { message: err });
            });
          } else {
            toast.error(parsed.message || "Login failed.");
          }
        } catch {
          toast.error(error.message || "Something went wrong.");
        }
      }
    },
  });

  const onSubmit: SubmitHandler<LoginSchema> = (data) =>
    mutate({ username: data.username, password: data.password });

  return (
    <>
      {/* Mobile OTP Modal */}
      {showMobileModal && (
        <MobileOtpModal onClose={() => setShowMobileModal(false)} />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <TextInput
          label="Username (Email / Mobile)"
          placeholder="Enter your email or phone number"
          error={errors.username?.message}
          register={register("username")}
        />

        <div className="flex flex-col gap-1">
          <PasswordInput
            label="Password"
            placeholder="Enter correct password"
            error={errors.password?.message}
            register={register("password")}
          />
          <div className="flex justify-end mt-1">
            <Link
              href="/auth/forget-password"
              className="text-xs text-gray-500 dark:text-white dark:hover:text-yellow-600 hover:text-gray-900 transition-colors"
            >
              Forget Password?
            </Link>
          </div>
        </div>

        {/* Phone login trigger */}
        <p
          onClick={() => setShowMobileModal(true)}
          className="text-sm text-gray-600 font-bold dark:text-yellow-600 dark:hover:text-white text-center underline hover:text-gray-900 transition-colors cursor-pointer"
        >
          Login with Phone number
        </p>

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
              Logging in...
            </span>
          ) : (
            "LOG IN"
          )}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-white">
          Havent any account?{" "}
          <Link
            href="/auth/registration"
            className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
          >
            Sign Up
          </Link>
        </p>

        <SocialLogin />
      </form>
    </>
  );
};

export default LoginForm;
