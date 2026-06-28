import React from "react";
import RegisterForm from "@/components/Auth/RegisterForm";

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight dark:text-white">
            dazzle
            <sup className="text-xs font-normal align-super ml-0.5 dark:text-white">™</sup>
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-2 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-500 mt-1 dark:text-white">
            Create an Account to Continue
          </p>
        </div>

        {/* Form */}
        <RegisterForm />

      </div>
    </div>
  );
};

export default RegisterPage;
