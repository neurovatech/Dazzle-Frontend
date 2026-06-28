"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// import { useNavigate } from "react-router-dom";

import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import TextInput from "@/components/ui/TextInput";
import Link from 'next/link'
import { FacebookIcon, GoogleIcon, InstragramIcon } from "@/icon";

const ForgetPassword: React.FC = () => {
  //   const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginSchema>({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      // 🔁 Replace with your real API call
      await new Promise((res) => setTimeout(res, 1200));
      reset();
      //   navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleForgotPassword = (): void => {
    // navigate("/forgot-password");
  };



  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <TextInput
        label="Email"
        placeholder="Enter email"
        error={errors.emailOrPhone?.message}
        register={register("emailOrPhone")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
      >
        {isSubmitting ? (
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
          "Forget Password"
        )}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-white">
        Havent any account?{" "}
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

export default ForgetPassword;

