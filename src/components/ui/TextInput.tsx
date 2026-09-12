"use client"
import React from "react";

interface TextInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  error,
  register,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-semibold text-gray-800 dark:text-white">{label}</label>
      <input
        {...register}
        type="text"
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#3e3329] dark:text-white text-lg text-gray-800 placeholder-gray-400 outline-none border-2 transition-all duration-200 placeholder:text-lg
          ${
            error
              ? "border-red-400 focus:border-red-500 bg-red-50"
              : "border-transparent focus:border-gray-900 dark:bg-[#3e3329]"
          }`}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-0.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;