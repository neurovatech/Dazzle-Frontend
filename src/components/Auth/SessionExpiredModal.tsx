"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsOpen(true);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("apiKey");
    }
    setIsOpen(false);
    router.push("/auth/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center p-6 border border-gray-100 dark:border-white/10">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Session Expired
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Your session has expired. Please log out and log in again to continue.
        </p>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          LOG OUT & LOG IN AGAIN
        </button>
      </div>
    </div>
  );
}
