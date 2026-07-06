/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      router.back();
      const fallback = setTimeout(() => {
        router.push("/");
      }, 300);

      return () => clearTimeout(fallback);
    } else {
      setChecking(false);
    }
  }, [token, router]);

  if (checking) {
    // Elegant loading spinner to prevent UI flashing
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#12100E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
