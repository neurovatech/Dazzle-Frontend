"use client";
import React, { useState } from "react";

interface TermsCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  companyName?: string;
  termsUrl?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked: externalChecked,
  onChange,
  companyName = "Dazzle",
  termsUrl = "/terms",
}) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = externalChecked ?? internalChecked;

  const handleChange = () => {
    const next = !checked;
    setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-3  pl-4 py-6">
      <button
        type="button"
        onClick={handleChange}
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 border-2
          ${
            checked
              ? "bg-green-500 border-green-500"
              : "bg-white border-gray-300 hover:border-gray-400"
          }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <p className="text-sm font-medium text-gray-500">
        I agree to {companyName}&apos;s{" "}
        <a
          href={termsUrl}
          className="text-amber-600 font-bold hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          terms &amp; conditions
        </a>
      </p>
    </div>
  );
};

export default TermsCheckbox;
