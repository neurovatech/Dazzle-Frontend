/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only check on initial mount — don't redirect on logout
    // (ProfileSideNav.logout calls router.push("/") first before clearing token)
    setChecking(false);
    if (!token) {
      router.push("/auth/login?redirect=/profile");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty deps: runs once on mount only

  if (checking) {
    // Prevent UI flashing of private profile details
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-[#12100E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
