"use client";

import { ChevronRight } from "lucide-react";
import type { TradeInStep } from "./tradeIn.types";

const STEPS = ["Select device", "Device details", "Collection method"] as const;

// Map stepper index → the internal wizard step to jump to
const STEPPER_TO_STEP: Record<number, TradeInStep> = {
  0: 0, // Select device → go to category step
  1: 2, // Device details → go to model/variant step
  2: 4, // Collection method → go to collection step
};

interface Props {
  currentStep:  TradeInStep;
  onStepClick?: (step: TradeInStep) => void;
}

export default function TradeInStepper({ currentStep, onStepClick }: Props) {
  const stepperIndex = currentStep <= 1 ? 0 : currentStep <= 3 ? 1 : 2;

  return (
    <div className="flex items-center justify-center gap-6 py-6">
      {STEPS.map((label, i) => {
        const isDone   = i < stepperIndex;
        const isActive = i === stepperIndex;
        // Only completed (done) steps are clickable
        const isClickable = isDone && !!onStepClick;

        return (
          <div key={label} className="flex items-center gap-2">
            {/* Arrow before the active step */}
            {isActive && (
              <ChevronRight
                size={16}
                className="text-[#1a1a6e] fill-[#1a1a6e]"
                strokeWidth={3}
              />
            )}

            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(STEPPER_TO_STEP[i])}
              className={`text-sm font-semibold leading-tight text-center transition-opacity
                ${isDone
                  ? "text-red-500 hover:opacity-75 cursor-pointer"
                  : isActive
                  ? "text-gray-900 dark:text-white cursor-default"
                  : "text-gray-400 dark:text-gray-500 cursor-default"
                }
                ${!isClickable ? "pointer-events-none" : ""}
              `}
            >
              {label.split(" ").map((w, wi) => (
                <span key={wi} className="block">{w}</span>
              ))}
            </button>
          </div>
        );
      })}
    </div>
  );
}
