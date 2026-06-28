"use client";
import Breadcrumb from "@/components/share/Breadcrumb";
import VisitOurStore from "@/components/share/VisitOurStore";
import { corporateSchema, CorporateSchema } from "@/schemas/corporateSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";

const Corporate = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Corporate", href: "#" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CorporateSchema>({
    resolver: yupResolver(corporateSchema),
    mode: "onTouched",
    // defaultValues: {
    //   agreeToTerms: false,
    // },
  });

  const onSubmit: SubmitHandler<CorporateSchema> = async (data) => {
    try {
      await new Promise((res) => setTimeout(res, 1200));
      reset();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="bg-[#FFFBF6] md:bg-white dark:bg-[#302d29] font-sans md:p-0 p-5">
      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="pt-11 max-w-150 mx-auto">
        <h3 className="text-[32px] text-center font-semibold pb-11">
          Integrate Smartphones & Gadgets for Corporate Connectivity
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6`}>
          {/* Name */}
          <div>
            <label className="block text-base font-medium text-gray-800 mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Enter your company name"
              {...register("companyName")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block text-base font-medium text-gray-800 mb-1">
              Meeting Date
            </label>
            <input
              type="date"
              placeholder="Select meeting date"
              {...register("meetingDate")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.meetingDate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.meetingDate.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-base font-medium text-gray-800 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              {...register("phoneNumber")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-base font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full px-4 py-4 rounded-[20px] border border-[#E7E7E7] bg-[#FAFAFA] text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7B4F1E]/30 focus:border-[#7B4F1E]"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            type="submit"
            // disabled={isSubmitting}
            className="w-full py-4 rounded-[20px] bg-gray-900 text-white text-base font-bold tracking-widest uppercase hover:bg-gray-700 transition-all duration-200 mt-4"
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

export default Corporate;
