"use client";
import Breadcrumb from "@/components/share/Breadcrumb";
import VisitOurStore from "@/components/share/VisitOurStore";
import { getInTouchSchema, GetInTouchSchema } from "@/schemas/getInTouchSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";

const Support = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Support Center", href: "#" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GetInTouchSchema>({
    // @ts-expect-error TypeScript doesn't understand yupResolver here, but it works at runtime
    resolver: yupResolver(getInTouchSchema),
    mode: "onTouched",
    // defaultValues: {
    //   agreeToTerms: false,
    // },
  });

  const onSubmit: SubmitHandler<GetInTouchSchema> = async (data) => {
    try {
      await new Promise((res) => setTimeout(res, 1200));
      reset();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#302d29] font-sans p-5">
      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="pt-11 max-w-150 mx-auto">
        <h3 className="text-[32px] text-center font-semibold pb-11">
          Get In Touch
        </h3>
        {/* @ts-expect-error TypeScript doesn't understand the yupResolver, but it works at runtime */}
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-5`}>
          {/* Name */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register("name")}
              className="w-full px-4 py-3 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
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
              className="w-full px-4 py-3 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
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
              className="w-full px-4 py-3 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Compare Product */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Compare Product
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              {...register("compareProduct")}
              className="w-full px-4 py-3 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.compareProduct && (
              <p className="text-xs text-red-500 mt-1">
                {errors.compareProduct.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-white mb-1">
              Message
            </label>
            <textarea
              placeholder="Enter your message"
              rows={4}
              {...register("message")}
              className="w-full px-4 py-3 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] dark:bg-[#302d29] dark:text-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
          </div>

          {/* Buttons */}
          <button
            type="submit"
            // disabled={isSubmitting}
            className="w-full py-4 rounded-[20px] bg-gray-900 dark:bg-gray-500 text-white text-base font-bold tracking-widest uppercase  transition-all duration-200 mt-4"
          >
            SUBMIT
            {/* {isSubmitting ? (
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
        )} */}
          </button>
        </form>
      </div>

      <VisitOurStore />
    </div>
  );
};

export default Support;
