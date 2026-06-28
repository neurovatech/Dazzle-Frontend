"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";

import { compareSchema, CompareSchema } from "@/schemas/compareSchema";
import TextInput from "@/components/ui/TextInput";
import Link from 'next/link'

const ProductCompareCom: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompareSchema>({
    resolver: yupResolver(compareSchema),
    mode: "onTouched",
  });

   const onSubmit: SubmitHandler<CompareSchema> = async (data) => {
    try {
      await new Promise((res) => setTimeout(res, 1200));
      router.push("/product-compare/details");
      reset();
    } catch (error) {
      console.error("Submit failed:", error);
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
      {/* Product Name */}
      <TextInput
        label="Product Name *"
        placeholder="Enter product name"
        error={errors.productName?.message}
        register={register("productName", {
          required: "Product Name is required",
        })}
      />

      {/* Compare Product */}
      <TextInput
        label="Compare Product *"
        placeholder="Enter product to compare"
        error={errors.compareProduct?.message}
        register={register("compareProduct", {
          required: "Compare Product is required",
        })}
      />


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
            Loading...
          </span>
        ) : (
          "Submit"
        )}
      </button>
    </form>
  );
};

export default ProductCompareCom;

