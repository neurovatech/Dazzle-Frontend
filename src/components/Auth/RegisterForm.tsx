"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from 'next/link'

import { registerSchema, RegisterSchema } from "../../schemas/registerSchema";
import TextInput from "@/components/ui/TextInput";
import PasswordInput from "@/components/ui/PasswordInput";
import CheckboxInput from "@/components/ui/CheckboxInput";
import {GoogleIcon, FacebookIcon, InstragramIcon} from "@/icon";

const RegisterForm: React.FC = () => {


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RegisterSchema>({
    resolver: yupResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      agreeToTerms: false,
    },
  });

  // Live password strength indicator
  const passwordValue = watch("password", "");

  const getPasswordStrength = (
    pwd: string
  ): { label: string; color: string; width: string } => {
    if (!pwd) return { label: "", color: "", width: "w-0" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-400", width: "w-1/3" };
    if (score === 3 || score === 4)
      return { label: "Fair", color: "bg-yellow-400", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
    try {
      // 🔁 Replace with your real OTP API call
      await new Promise((res) => setTimeout(res, 1200));

      reset();
      // Navigate to OTP verification page, passing email/phone
    //   navigate("/verify-otp", {
    //     state: { emailOrPhone: data.emailOrPhone },
    //   });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleLoginRedirect = (): void => {
    // navigate("/login");
  };

  const TermsLabel: React.ReactNode = (
    <span>
      I agree to all{" "}
      <button
        type="button"
        className="text-yellow-500 font-semibold hover:underline"
        // onClick={() => navigate("/terms")}
      >
        Terms
      </button>
      ,{" "}
      <button
        type="button"
        className="text-yellow-500 font-semibold hover:underline"
        // onClick={() => navigate("/privacy")}
      >
        Privacy Policy
      </button>{" "}
      and fees
    </span>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Email / Phone */}
      <TextInput
        label="Email / Phone Number"
        placeholder="Enter email or phone number"
        error={errors.emailOrPhone?.message}
        register={register("emailOrPhone")}
      />

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <PasswordInput
          label="Password"
          placeholder="Enter correct password"
          error={errors.password?.message}
          register={register("password")}
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
        label="Confirm Password"
        placeholder="Enter confirm password"
        error={errors.confirmPassword?.message}
        register={register("confirmPassword")}
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
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
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
            Sending OTP...
          </span>
        ) : (
          "SEND OTP"
        )}
      </button>

      {/* Login redirect */}
      <p className="text-center text-sm text-gray-600 dark:text-white">
        Already have an account?{" "}
        <Link href="/auth/login"
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

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#222222DB] hover:bg-[#222222DB]/70 flex items-center justify-center transition-colors duration-200 shadow-sm"
          >
            <InstragramIcon />
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;