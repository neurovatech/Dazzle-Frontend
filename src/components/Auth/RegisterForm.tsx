"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MailCheck, X } from "lucide-react";

import { registerSchema, RegisterSchema } from "../../schemas/registerSchema";
import TextInput from "@/components/ui/TextInput";
import PasswordInput from "@/components/ui/PasswordInput";
import CheckboxInput from "@/components/ui/CheckboxInput";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setRegistrationData } from "@/store/slices/authSlice";
import SocialLogin from "./SocialLogin";

// ─── API Types ────────────────────────────────────────────────────────────────
interface RegisterPayload {
  userFullName: string;
  email: string;
  mobile: string;
  password: string;
  rePassword: string;
}

interface RegisterSuccessData {
  usersCommuuid: string;
  userFullName: string;
  email: string;
  emailVerifiedToken: string;
  createdAt: string;
  "x-api-key": string;
  Authorization: string;
}

interface RegisterResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data?: RegisterSuccessData;
  errors?: string[];
}

// ─── API Function ─────────────────────────────────────────────────────────────
async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("user-registration", payload);
}

// ─── Email Verification Success Modal ────────────────────────────────────────
interface EmailVerifyModalProps {
  email: string;
  onClose: () => void;
}

const EmailVerifyModal: React.FC<EmailVerifyModalProps> = ({ email, onClose }) => {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

        {/* Close button */}
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
              <MailCheck size={28} className="text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email Address
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
            A verification link has been sent to
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-5 break-all">
            {email}
          </p>

          {/* Info box */}
          <div className="w-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl px-5 py-4 mb-6">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
              Please check your inbox and click the verification link to activate
              your account. If you don&apos;t see the email, check your{" "}
              <strong>spam or junk folder</strong>.
            </p>
          </div>

          {/* OK Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold tracking-widest uppercase hover:bg-gray-700 dark:hover:bg-gray-100 transition-all duration-200"
          >
            OK, Got It
          </button>

          {/* Login redirect */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Already verified?{" "}
            <Link
              href="/auth/login"
              className="text-yellow-500 font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main RegisterForm Component ──────────────────────────────────────────────
const RegisterForm: React.FC = () => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RegisterSchema>({
    resolver: yupResolver(registerSchema) as never,
    mode: "onTouched",
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const dispatch = useAppDispatch();

  // ─── React Query Mutation ─────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (response, variables) => {
      if (response.statusCode === 200 && response.status === "success") {
        // Dispatch to Redux store
        if (response.data) {
          dispatch(
            setRegistrationData({
              user: {
                usersCommuuid: response.data.usersCommuuid,
                userFullName: response.data.userFullName,
                email: response.data.email,
                emailVerifiedToken: response.data.emailVerifiedToken,
                createdAt: response.data.createdAt,
              },
              apiKey: response.data["x-api-key"],
              token: response.data.Authorization,
            })
          );
        }
        // Reset form immediately on success
        reset();
        // Store the registered email and show the professional verify modal
        setRegisteredEmail(variables.email);
        setShowVerifyModal(true);
      } else {
        toast.error(response.message || "Something went wrong.");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message) as RegisterResponse;
          if (parsed.errors && parsed.errors.length > 0) {
            // Show each server error as a toast
            parsed.errors.forEach((err) => toast.error(err));
            // Map errors back to form fields
            parsed.errors.forEach((err) => {
              const e = err.toLowerCase();
              if (e.includes("email")) setError("email", { message: err });
              if (e.includes("mobile")) setError("mobile", { message: err });
              if (e.includes("password") && !e.includes("re")) setError("password", { message: err });
              if (e.includes("repassword") || e.includes("match")) setError("rePassword", { message: err });
              if (e.includes("userfullname") || e.includes("name")) setError("userFullName", { message: err });
            });
          } else {
            toast.error(parsed.message || "Registration failed.");
          }
        } catch {
          toast.error(error.message || "Registration failed. Please try again.");
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    },
  });

  // ─── Submit Handler ───────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<RegisterSchema> = (data) => {
    mutate({
      userFullName: data.userFullName,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      rePassword: data.rePassword,
    });
  };

  const TermsLabel: React.ReactNode = (
    <span>
      I agree to all{" "}
      <Link
        href="/terms-conditions"
        className="text-yellow-500 font-semibold hover:underline"
      >
        Terms
      </Link>
      ,{" "}
      <Link
        href="/privacy-policy"
        className="text-yellow-500 font-semibold hover:underline"
      >
        Privacy Policy
      </Link>{" "}
      and fees
    </span>
  );

  return (
    <>
      {/* Email Verification Success Modal */}
      {showVerifyModal && (
        <EmailVerifyModal
          email={registeredEmail}
          onClose={() => setShowVerifyModal(false)}
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Full Name */}
        <TextInput
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.userFullName?.message}
          register={register("userFullName")}
        />

        {/* Email */}
        <TextInput
          label="Email Address"
          placeholder="Enter your email address"
          error={errors.email?.message}
          register={register("email")}
        />

        {/* Mobile */}
        <TextInput
          label="Phone Number"
          placeholder="e.g. 01700000000"
          error={errors.mobile?.message}
          register={{
            ...register("mobile"),
            inputMode: "numeric",
            maxLength: 11,
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
              const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
              if (allowed.includes(e.key)) return;
              if (!/^\d$/.test(e.key)) e.preventDefault();
            },
            onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
              const pasted = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasted)) e.preventDefault();
            },
          }}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          register={register("password")}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={errors.rePassword?.message}
          register={register("rePassword")}
        />

        {/* Terms Checkbox */}
        <CheckboxInput
          label={TermsLabel}
          error={errors.agreeToTerms?.message}
          register={register("agreeToTerms")}
        />

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
              Creating Account...
            </span>
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>

        {/* Login redirect */}
        <p className="text-center text-sm text-gray-600 dark:text-white">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
          >
            Log In
          </Link>
        </p>

        {/* Social Login — temporarily hidden, not ready for launch yet.
            Uncomment when Google/Facebook login should go live again. */}
        {/* <SocialLogin /> */}
      </form>
    </>
  );
};

export default RegisterForm;
