"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { takeGoogleOAuthSession } from "@/lib/socialAuth";

/**
 * Where Google sends the browser back after the consent screen
 * (redirect_uri = <origin>/signin-google). Google appends ?code=... (or
 * ?error=... if the visitor cancelled); this page verifies the `state` it
 * started the login with, then trades the code for a session via the backend.
 */
export default function SigninGooglePage() {
  const { completeGoogleLogin } = useSocialAuth();
  const [error, setError] = useState<string | null>(null);
  // An authorization code works exactly once, and React StrictMode runs this
  // effect twice in dev — without the guard the second run would resubmit the
  // same (now spent) code and turn a successful login into an error.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");
    const session = takeGoogleOAuthSession();

    if (oauthError) {
      setError(
        oauthError === "access_denied"
          ? "Google sign-in was cancelled."
          : `Google sign-in failed (${oauthError}).`,
      );
      return;
    }
    if (!code) {
      setError("Google didn't send back an authorization code. Please try again.");
      return;
    }
    if (!session || session.state !== state) {
      setError("This Google sign-in session is invalid or has expired. Please try again.");
      return;
    }

    completeGoogleLogin(code, session.redirectUri, session.returnTo).then((ok) => {
      if (!ok) setError("We couldn't sign you in with Google. Please try again.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <>
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Google sign-in didn&apos;t complete
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-[#222222] text-white text-sm font-bold hover:bg-[#444444] transition-colors"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#B57908] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Signing you in with Google…</p>
          </>
        )}
      </div>
    </div>
  );
}
