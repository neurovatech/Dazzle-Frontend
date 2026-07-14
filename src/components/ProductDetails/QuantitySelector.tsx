/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  /** Controlled value — if provided, the selector reflects this value exactly */
  value?: number;
  onChange?: (val: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  min = 1,
  max = 99,
  defaultValue = 1,
  value,
  onChange,
}) => {
  // If `value` prop is provided (controlled mode), use it; otherwise fall back to internal state
  const isControlled = value !== undefined;
  const [internalQty, setInternalQty] = useState(defaultValue);

  const qty = isControlled ? value : internalQty;

  // Sync internal state when defaultValue changes from outside (e.g. parent resets)
  useEffect(() => {
    if (!isControlled) {
      setInternalQty(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const update = (next: number) => {
    const clamped = Math.min(Math.max(next, min), max);
    if (!isControlled) {
      setInternalQty(clamped);
    }
    onChange?.(clamped);
  };

  return (
    <div className="flex items-center gap-0 border border-[#EEEEEE] bg-[#FFFFFF] p-1 rounded-[10px]">
      <button
        onClick={() => update(qty - 1)}
        disabled={qty <= min}
        className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 transition rounded-[10px]"
      >
        <Minus size={14} className="dark:text-black" />
      </button>

      <div className="w-10 h-9 flex items-center justify-center text-sm font-bold text-gray-800 select-none ">
        {qty}
      </div>

      <button
        onClick={() => update(qty + 1)}
        disabled={qty >= max}
        className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-[#222222] hover:bg-[#222222]/50 disabled:opacity-40 transition text-white rounded-[10px]"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantitySelector;
