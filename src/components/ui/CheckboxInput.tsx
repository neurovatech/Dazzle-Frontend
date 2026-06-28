import React from "react";

interface CheckboxInputProps {
  label: React.ReactNode;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  error,
  register,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            {...register}
            type="checkbox"
            className="peer appearance-none w-5 h-5 rounded border-2 border-gray-300 bg-white checked:bg-gray-900 checked:border-gray-900 transition-all duration-200 cursor-pointer"
          />
          {/* Custom checkmark */}
          <svg
            className="absolute inset-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10l4 4 6-7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-sm text-gray-600 dark:text-white leading-snug group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 ml-8">
          <svg
            width="12"
            height="12"
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

export default CheckboxInput;