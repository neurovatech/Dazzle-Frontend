"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

/**
 * Renders nothing. When the API layer decides the session is dead (a 401 that
 * a token refresh couldn't rescue — see triggerSessionExpired in lib/api.ts)
 * it fires a "session-expired" event; this logs the visitor out and sends them
 * straight to the login page, instead of stopping them behind a modal that
 * only offers a "log out and log in again" button.
 */
export default function SessionExpiredHandler() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // A page often fires several requests at once, so one dead session produces
  // a burst of 401s and therefore a burst of events — handle only the first.
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      dispatch(logout());
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("apiKey");
      } catch {}

      // Fixed id: even if this somehow ran twice, only one toast is shown.
      toast.error("Your session has expired. Please log in again.", {
        id: "session-expired",
      });

      const { pathname, search } = window.location;
      if (!pathname.startsWith("/auth")) {
        // Come back to the page they were on once they've logged in again.
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname + search)}`);
      }

      window.setTimeout(() => {
        handlingRef.current = false;
      }, 3000);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [dispatch, router]);

  return null;
}
