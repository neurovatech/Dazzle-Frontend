"use client";
import { useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  size?: "sm" | "md";
}

export default function CountdownBadges({ size = "sm" }: Props) {
  const [target] = useState(
    () =>
      new Date(Date.now() + 2 * 86400000 + 12 * 3600000 + 56 * 60000 + 56000),
  );

  const { days, hours, minutes, seconds } = useCountdown(target);

  const pad = (n: number) => String(n).padStart(2, "0");

  const labels = [
    { value: pad(days), label: "Day" },
    { value: pad(hours), label: "Hours" },
    { value: pad(minutes), label: "Min" },
    { value: pad(seconds), label: "Sec" },
  ];

  const base =
    size === "md"
      ? "bg-[#6D3F0E] text-white font-medium rounded-md px-3 py-1.5 text-sm"
      : "bg-[#6D3F0E] text-white font-medium rounded-md px-2.5 py-1 text-sm";

  return (
    <div className="flex items-center gap-1">
      {labels.map(({ value, label }, i) => (
        <span key={label} className="flex items-center gap-1.5 dark:text-white">
          <span className={base}>
            {value} {label}
          </span>
          {i < labels.length - 1 && (
            <span className="text-[#3d2000] font-bold text-sm">:</span>
          )}
        </span>
      ))}
    </div>
  );
}
