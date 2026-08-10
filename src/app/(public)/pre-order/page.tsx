/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";
import React, { useState, useRef, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { ChevronLeft, X, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

type CustomRequestFormData = {
  productNameOrUrl?: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  address: string;
  agreeToTerms: boolean;
};

const PreOrderPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomRequestFormData>({
    mode: "onTouched",
    defaultValues: { agreeToTerms: false },
  });

  // TanStack React Query mutation
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<unknown>("/feedback", formData);
    },
    onSuccess: () => {
      toast.success("Your pre-order has been submitted successfully!");
      reset();
      setImages([]);
      setPreviews([]);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("failed to submit pre-order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit pre-order. Please try again."
      );
    },
  });

  /* ── image helpers ── */
  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    if (previews.length > 0) {
      URL.revokeObjectURL(previews[0]);
    }

    const previewUrl = URL.createObjectURL(file);
    setImages([file]);
    setPreviews([previewUrl]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages([]);
    setPreviews([]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  /* ── submit ── */
  const onSubmit: SubmitHandler<CustomRequestFormData> = async (data) => {
    const formData = new FormData();
    formData.append("fullName", data.name);
    formData.append("email", data.email);
    formData.append("mobileNo", data.phone);
    formData.append("subject", data.productNameOrUrl || "");
    formData.append("description", data.address);
    formData.append("subject", data.subject);
    formData.append("identifierTag", "pre-order");

    if (images.length > 0) {
      formData.append("imagePathName", images[0]);
    }

    mutation.mutate(formData);
  };

  /* ── shared input classes ── */
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#bd9961] focus:ring-2 focus:ring-[#bd9961]/20 transition-all duration-200";

  const errCls = "text-xs text-red-500 mt-1 pl-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbf6]  dark:bg-[#2e2b28] px-4 py-10 transition-colors duration-300">
      <div className="w-full max-w-125">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Looking For Something Different?
          </h1>

          <p className="mt-1.5 text-sm font-medium text-[#bd9961] dark:text-[#D4A97A]">
            Put Your Information in The Box...
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#161616] border border-[#EBEBEB] dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Product name / URL */}
            <div>
              <input
                {...register("productNameOrUrl")}
                placeholder="Enter product name/URL..."
                className={inputCls}
              />
            </div>

            {/* Image upload area */}
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-5
              ${
                isDragging
                  ? "border-[#bd9961] bg-[#bd9961]/10"
                  : "border-[#bd9961]/50 bg-[#bd9961]/5 hover:border-[#bd9961] hover:bg-[#bd9961]/10"
              }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-900 dark:bg-[#D4A97A] flex items-center justify-center">
                  <ImagePlus size={18} className="text-white dark:text-black" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {images.length > 0 ? "Image Added" : "Add Image"}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {images.length > 0 ? images[0].name : "Click or drag & drop"}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* Image preview grid */}
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={src}
                          alt={`preview-${idx}`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-500"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <input
                {...register("name", {
                  required: "Name is required",
                })}
                placeholder="Name"
                className={inputCls}
              />

              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <input
                {...register("phone", {
                  required: "Phone number is required",
                })}
                placeholder="Phone number"
                type="tel"
                className={inputCls}
              />

              {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                placeholder="Email"
                type="email"
                className={inputCls}
              />

              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register("subject", {
                  required: "Subject is required",
                })}
                placeholder="Subject"
                className={inputCls}
              />

              {errors.subject && <p className={errCls}>{errors.subject.message}</p>}
            </div>

            {/* Address */}
            <div>
              <textarea
                {...register("address")}
                placeholder="Address..."
                rows={3}
                className={`${inputCls} resize-none`}
              />

              {errors.address && (
                <p className={errCls}>{errors.address.message}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    {...register("agreeToTerms", {
                      required: "You must accept Terms & Conditions",
                    })}
                    className="peer sr-only"
                  />

                  <div className="w-4 h-4 rounded border border-[#E5E5E5] dark:border-gray-700 bg-white dark:bg-[#1A1A1A] peer-checked:bg-[#bd9961] peer-checked:border-[#bd9961] transition-all duration-200 flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                </div>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I accept{" "}
                  <Link
                    href="/terms-conditions"
                    className="text-[#bd9961] dark:text-[#D4A97A] font-semibold underline underline-offset-2 hover:text-[#a8844f] transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </label>

              {errors.agreeToTerms && (
                <p className={errCls}>{errors.agreeToTerms.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3.5 mt-1 rounded-xl bg-[#F5EDE0] dark:bg-[#D4A97A]/15 border border-[#E8D8C0] dark:border-[#D4A97A]/30 text-[#8B6B3D] dark:text-[#D4A97A] text-sm font-bold tracking-[0.15em] uppercase hover:bg-[#EDE0CC] dark:hover:bg-[#D4A97A]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
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
                  Submitting...
                </span>
              ) : (
                "SUBMIT"
              )}
            </button>

            {/* Back to home */}
            <Link
              href="/"
              className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors mt-1"
            >
              <ChevronLeft size={15} />
              BACK TO HOME
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreOrderPage;
