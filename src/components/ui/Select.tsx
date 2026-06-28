"use client";

import React, { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "default" | "ghost" | "pill";
type SelectState = "default" | "error" | "success";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface GlobalSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Field label shown above the select */
  label?: string;
  /** Helper / hint text shown below */
  hint?: string;
  /** Options array (flat) */
  options?: SelectOption[];
  /** Option groups */
  groups?: SelectGroup[];
  /** Visual size */
  size?: SelectSize;
  /** Visual variant */
  variant?: SelectVariant;
  /** Validation state */
  state?: SelectState;
  /** Optional icon rendered on the left (any React node) */
  prefixIcon?: React.ReactNode;
  /** Full-width (default: true) */
  fullWidth?: boolean;
}

// ─── Class maps ───────────────────────────────────────────────────────────────

const sizeClasses: Record<SelectSize, string> = {
  sm: "h-8 text-xs pl-3 pr-8",
  md: "h-10 text-sm pl-3.5 pr-9",
  lg: "h-12 text-base pl-4 pr-10",
};

const sizeWithIconClasses: Record<SelectSize, string> = {
  sm: "pl-8",
  md: "pl-9",
  lg: "pl-10",
};

const chevronSizeClasses: Record<SelectSize, string> = {
  sm: "right-2 w-3.5 h-3.5",
  md: "right-2.5 w-4 h-4",
  lg: "right-3 w-5 h-5",
};

const prefixIconSizeClasses: Record<SelectSize, string> = {
  sm: "left-2 w-3.5 h-3.5",
  md: "left-2.5 w-4 h-4",
  lg: "left-3 w-5 h-5",
};

const variantClasses: Record<SelectVariant, string> = {
  default: "bg-white  border border-zinc-200 ",
  ghost:   "bg-zinc-100 dark:bg-zinc-800 border border-transparent",
  pill:    "bg-white  border rounded-full text-[#222222] font-bold",
};

const stateClasses: Record<SelectState, string> = {
  default: "focus:border-blue-500 focus:ring-blue-500/20",
  error:   "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
  success: "border-emerald-400 dark:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20",
};

const hintColorClasses: Record<SelectState, string> = {
  default: "text-[#222222]",
  error:   "text-red-500",
  success: "text-emerald-600 ",
};

// ─── Component ────────────────────────────────────────────────────────────────

const GlobalSelect = forwardRef<HTMLSelectElement, GlobalSelectProps>(
  (
    {
      label,
      hint,
      options = [],
      groups = [],
      size = "md",
      variant = "default",
      state = "default",
      prefixIcon,
      fullWidth = true,
      className = "",
      disabled,
      id,
      ...rest
    },
    ref
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const baseClasses = [
      "appearance-none cursor-pointer outline-none",
      "rounded-lg transition-all duration-150",
      "text-zinc-800 dark:text-[#2222222]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      "focus:ring-2",
      fullWidth ? "w-full" : "",
      sizeClasses[size],
      prefixIcon ? sizeWithIconClasses[size] : "",
      variant === "pill" ? "" : "rounded-lg",
      variantClasses[variant],
      stateClasses[state],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const hasOptions = options.length > 0 || groups.length > 0;

    return (
      <div className={fullWidth ? "w-full" : "inline-flex flex-col"}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative flex items-center">
          {/* Prefix icon */}
          {prefixIcon && (
            <span
              className={`absolute pointer-events-none text-zinc-400 dark:text-zinc-500 ${prefixIconSizeClasses[size]}`}
            >
              {prefixIcon}
            </span>
          )}

          {/* Native select */}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={baseClasses}
            {...rest}
          >
            {hasOptions ? (
              <>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
                {groups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            ) : (
              rest.children
            )}
          </select>

          {/* Chevron icon */}
          <ChevronDown
            className={`absolute pointer-events-none text-zinc-400 dark:text-zinc-500 ${chevronSizeClasses[size]}`}
            strokeWidth={1.75}
          />
        </div>

        {/* Hint */}
        {hint && (
          <p className={`mt-1.5 text-xs ${hintColorClasses[state]}`}>{hint}</p>
        )}
      </div>
    );
  }
);

GlobalSelect.displayName = "GlobalSelect";

export default GlobalSelect;