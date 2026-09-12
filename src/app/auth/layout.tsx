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
      // This effect also fires the instant LoginForm's own onSuccess handler
      // sets the token — i.e. right as that handler calls
      // `router.push(redirectUrl)` to send the user to checkout (or wherever
      // they came from). `router.back()` here raced that push and, being a
      // history-relative jump, usually won: it landed the user on whatever
      // page was open *before* they clicked "Log in" — the cart page in the
      // reported case — instead of the checkout page they were headed to.
      // Reading the same `redirect` param LoginForm already targets, and
      // using `replace` instead of `back`/`push`, makes both effects agree
      // on the same destination regardless of which one runs first, and
      // stops piling up an extra history entry either way.
      const redirectUrl = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      router.replace(redirectUrl || "/");
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
