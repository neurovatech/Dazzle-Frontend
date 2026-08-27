/* eslint-disable react/no-unescaped-entities */
import React from "react";
import ForgetPassword from "@/components/Auth/ForgetPassword";
import GlobalLogo from "@/components/share/GlobalLogo";

const ForgetPasswordPage: React.FC = () => {
  return (
    <div className="py-8 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <GlobalLogo />
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Welcome Back! You've Been Missed!
          </p>
        </div>
        <ForgetPassword />
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
