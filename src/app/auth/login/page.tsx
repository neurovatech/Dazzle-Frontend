import React from "react";
import LoginForm from "@/components/Auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="py-8 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            dazzle
            <sup className="text-xs font-normal align-super ml-0.5">™</sup>
          </h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Welcome Back You ve Been Missed!
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;