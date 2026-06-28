import React from "react";
import ForgetPassword from "@/components/Auth/ForgetPassword";

const ForgetPasswordPage: React.FC = () => {
  return (
    <div className="py-8 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight dark:text-white">
            dazzle
            <sup className="text-xs font-normal align-super ml-0.5 dark:text-white">™</sup>
          </h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Welcome Back You ve Been Missed!
          </p>
        </div>
        <ForgetPassword />
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
