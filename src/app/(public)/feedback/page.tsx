/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Breadcrumb from "@/components/share/Breadcrumb";
import { FeedbackSchema, feedbackSchema } from "@/schemas/feedbackSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Upload } from "lucide-react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Feedback = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Feedback", href: "#" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FeedbackSchema>({
    resolver: yupResolver(feedbackSchema) as unknown as Resolver<FeedbackSchema>,
    mode: "onTouched",
  });

  const watchedImage = watch("image");
  const fileName =
    watchedImage && watchedImage instanceof FileList && watchedImage.length > 0
      ? watchedImage[0].name
      : watchedImage && watchedImage instanceof File
      ? (watchedImage as File).name
      : "";

  // TanStack React Query mutation
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<unknown>("/feedback", formData);
    },
    onSuccess: () => {
      toast.success("Your feedback has been submitted successfully!");
      setSuccessMessage("Your feedback has been submitted successfully!");
      reset();
    },
    onError: (error: any) => {
      console.error("failed to submit feedback:", error);
      const errMsg =
        error instanceof Error ? error.message : "Failed to submit feedback. Please try again.";
      toast.error(errMsg);
      setErrorMessage(errMsg);
    },
  });

  const onSubmit: SubmitHandler<FeedbackSchema> = async (data) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("fullName", data.name);
    formData.append("email", data.email);
    formData.append("mobileNo", data.phoneNumber);
    formData.append("subject", data.subject);
    formData.append("description", data.description || "");
    formData.append("identifierTag", "feedback");

    if (data.image && data.image instanceof FileList && data.image.length > 0) {
      formData.append("imagePathName", data.image[0]);
    } else if (data.image && data.image instanceof File) {
      formData.append("imagePathName", data.image);
    }

    mutation.mutate(formData);
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#2E2B28] font-sans md:p-0 p-5 mb-20">
      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="pt-11 max-w-150 mx-auto">
        <h3 className="text-[32px] text-center font-semibold pb-11">
          Send Your Feedback
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6`}>
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

          {/* Name */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register("name")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
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

          {/* Subject */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter subject"
              {...register("subject")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.subject && (
              <p className="text-xs text-red-500 mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              {...register("description")}
              rows={4}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
          </div>

          {/* Upload Image Section */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-2">
              Upload Image (Images or PDF, Max 5MB)
            </label>

            <div className="relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                {...register("image")}
              />

              <div className="w-full py-6 px-4 rounded-[30px] border-2 border-dashed border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white flex flex-col items-center justify-center text-center transition-all hover:bg-gray-50">
                {/* Upload Icon */}
                <div className="mb-4">
                  <Upload className="w-8 h-8 text-gray-800 dark:text-white" />
                </div>

                {/* Text Instructions */}
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                  {fileName ? "Selected File:" : "Upload Image or PDF here"}
                </h3>

                {fileName ? (
                  <div className="mt-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-2xl text-sm font-semibold border border-green-200/50 dark:border-green-800/30">
                    {fileName}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">
                      File size can be maximum 5MB
                    </p>
                    <p className="text-sm text-gray-400 max-w-[400px] mx-auto leading-relaxed">
                      Only PDF and image files are allowed. Please ensure you meet the community guidelines before uploading.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.image && (
              <p className="text-xs text-red-500 mt-1">
                {errors.image.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 rounded-[20px] bg-gray-900 text-white dark:bg-gray-500 text-base font-bold tracking-widest uppercase transition-all duration-200 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
    </div>
  );
};

export default Feedback;
