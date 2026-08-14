/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SunIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme =
    theme === "system" ? resolvedTheme : theme;

  const isDark = currentTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // The button is ALWAYS rendered at its final size, even before mount.
  // Previously this returned null until mounted, so the header re-flowed once
  // hydration completed — a layout shift on every page, above the fold.
  // Only the icon (which depends on the resolved theme, unknown on the server)
  // waits for mount; the 54x54 box is reserved from the first paint.
  return (
    <button
      onClick={handleToggle}
      disabled={!mounted}
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      className="w-13.5 h-13.5 rounded-xl bg-[#E9CCAE47] flex items-center justify-center transition-all duration-300"
    >
      <div
        className={`transition-all duration-300 ${
          isDark ? "text-white" : "text-yellow-400"
        }`}
      >
        {/* Before mount the theme is unknown; render an invisible placeholder of
            the same 16x16 footprint so nothing moves when the real icon swaps in. */}
        {mounted ? (
          isDark ? <MoonIcon /> : <SunIcon />
        ) : (
          <span className="block w-4 h-4" aria-hidden="true" />
        )}
      </div>
    </button>
  );
}