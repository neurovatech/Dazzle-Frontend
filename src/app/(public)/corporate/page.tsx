/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Breadcrumb from "@/components/share/Breadcrumb";
import VisitOurStore from "@/components/share/VisitOurStore";
import { corporateSchema, CorporateSchema } from "@/schemas/corporateSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Corporate = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Corporate", href: "#" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CorporateSchema>({
    resolver: yupResolver(corporateSchema),
    mode: "onTouched",
  });

  // ── TanStack React Query mutation — POST /schedule ──────────────────────
  const mutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      return api.post<unknown>("/schedule", payload);
    },
    onSuccess: () => {
      toast.success("Your corporate inquiry has been submitted successfully!");
      setSuccessMessage("Your corporate inquiry has been submitted successfully!");
      setErrorMessage(null);
      reset();
    },
    onError: (error: any) => {
      console.error("Failed to submit corporate inquiry:", error);
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to submit. Please try again.";
      toast.error(errMsg);
      setErrorMessage(errMsg);
      setSuccessMessage(null);
    },
  });

  const onSubmit: SubmitHandler<CorporateSchema> = (data) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    mutation.mutate({
      companyName: data.companyName,
      meetingDate: data.meetingDate,
      mobileNo: data.phoneNumber,
      email: data.email,
      identifierTag: "corporate",
    });
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#302d29] font-sans md:p-0 p-5 mb-20">
      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="pt-11 max-w-150 mx-auto">
        <h3 className="text-[32px] text-center font-semibold pb-11 dark:text-white">
          Integrate Smartphones &amp; Gadgets for Corporate Connectivity
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Success / Error Notification */}
          {successMessage && (
            <div className="p-4 text-sm text-green-800 rounded-[20px] bg-green-50 dark:bg-green-900/30 dark:text-green-400 font-medium">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 text-sm text-red-800 rounded-[20px] bg-red-50 dark:bg-red-900/30 dark:text-red-400 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Enter your company name"
              {...register("companyName")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Meeting Date
            </label>
            <input
              type="date"
              {...register("meetingDate")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.meetingDate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.meetingDate.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              {...register("phoneNumber")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 rounded-[20px] bg-gray-900 text-white dark:bg-gray-500 text-base font-bold tracking-widest uppercase transition-all duration-200 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-600"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                SUBMITTING...
              </span>
            ) : (
              "SUBMIT"
            )}
          </button>
        </form>
      </div>

      <VisitOurStore />
    </div>
  );
};

export default Corporate;
