import React from "react";
import OtpForm from "@/components/Auth/OtpForm";
import GlobalLogo from "@/components/share/GlobalLogo";

const OtpPage: React.FC = () => {
  return (
    <div className=" flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <GlobalLogo />
          <h2 className="text-2xl font-bold text-gray-900 mt-3 dark:text-white">
            Account Verification
          </h2>
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Create an Account to Continue
          </p>
        </div>

        {/* OTP Form */}
        <OtpForm />

      </div>
    </div>
  );
};

export default OtpPage;