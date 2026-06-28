import React, {
  useRef,
  useEffect,
  ClipboardEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  isLeft?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  isLeft = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusBox = (index: number): void => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      // Move cursor to end
      setTimeout(() => el.setSelectionRange(1, 1), 0);
    }
  };

  // ✅ Main handler — fires on every keystroke
  const handleChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    const raw = e.target.value;

    // Extract only the NEW digit typed (last character if appended)
    const digit = raw.replace(/\D/g, "").slice(-1);

    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Move to next box if digit entered
    if (digit && index < length - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = [...value];

      if (newValue[index]) {
        // Clear current box
        newValue[index] = "";
        onChange(newValue);
      } else if (index > 0) {
        // Go back and clear previous
        newValue[index - 1] = "";
        onChange(newValue);
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusBox(index + 1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      const newValue = [...value];
      newValue[index] = "";
      onChange(newValue);
    }
  };

  // ✅ Paste support — fills all boxes at once
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const newValue = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      newValue[i] = char;
    });
    onChange(newValue);

    // Focus last filled box
    const lastIndex = Math.min(pasted.length - 1, length - 1);
    focusBox(lastIndex);
  };

  return (
    <div
      className={`flex flex-col gap-3 w-full ${isLeft ? "" : "items-center"}`}
    >
      <div
        className={`flex items-center gap-3 ${isLeft ? "" : "justify-center"}`}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={2}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${index + 1}`}
            className={`
              w-10 h-10
      sm:w-12 sm:h-12
      md:w-14 md:h-14
      text-lg sm:text-xl md:text-2xl
      text-center font-bold text-gray-900
      rounded-xl sm:rounded-2xl
      border-2 bg-gray-100 outline-none
      transition-all duration-200
      focus:bg-white focus:scale-105
              ${
                error
                  ? "border-red-400 bg-red-50 focus:border-red-400"
                  : value[index]
                    ? "border-gray-900 bg-white shadow-md"
                    : "border-transparent focus:border-gray-400"
              }
            `}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <svg
            width="13"
            height="13"
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

export default OtpInput;
