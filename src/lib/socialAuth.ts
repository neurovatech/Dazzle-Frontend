"use client";

/**
 * Client-side pieces of "Continue with Google/Facebook".
 *
 * Google uses the redirect (authorization-code) flow the backend's
 * POST /login-with-google expects: the browser is sent to Google, Google
 * sends it back to /signin-google?code=..., and that page hands the code (plus
 * the exact redirectUri that was used) to our backend, which does the token
 * exchange with Google server-side.
 *
 * Facebook still uses its JS SDK popup and returns an access token.
 */

declare global {
  interface Window {
    FB?: {
      init: (config: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        options?: { scope: string },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

// A Google OAuth client ID is a public identifier (it's visible in the
// consent-screen URL of every login), not a secret — the client SECRET stays
// on the backend. The env var lets a different environment use another client.
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1025049945726-ubns6jb2f4i9rua47svg69u0kvq0an84.apps.googleusercontent.com";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function isGoogleLoginConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID;
}

export function isFacebookLoginConfigured(): boolean {
  return !!FACEBOOK_APP_ID;
}

// ─── Google (redirect / authorization-code flow) ───────────────────────────

const GOOGLE_OAUTH_SESSION_KEY = "dazzle-google-oauth";

export interface GoogleOAuthSession {
  /** Random value echoed back by Google; must match on return (CSRF guard). */
  state: string;
  /** The exact redirect_uri sent to Google — the backend must reuse it verbatim. */
  redirectUri: string;
  /** Where to send the visitor once they're logged in. */
  returnTo: string;
}

/**
 * Only same-site paths are allowed as a post-login destination — anything
 * else (an absolute URL, or "//evil.com") would turn login into an open
 * redirect.
 */
function safeReturnPath(path: string | null | undefined): string {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

function googleRedirectUri(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${window.location.origin}/signin-google`
  );
}

/** Sends the browser to Google's consent screen. Does not return normally. */
export function startGoogleLogin(returnTo?: string | null): void {
  const state =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const redirectUri = googleRedirectUri();

  const session: GoogleOAuthSession = { state, redirectUri, returnTo: safeReturnPath(returnTo) };
  sessionStorage.setItem(GOOGLE_OAUTH_SESSION_KEY, JSON.stringify(session));

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  window.location.assign(url.toString());
}

/** Reads and clears the pending Google login (a code can only be used once). */
export function takeGoogleOAuthSession(): GoogleOAuthSession | null {
  try {
    const raw = sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleOAuthSession;
    return parsed.state && parsed.redirectUri
      ? { ...parsed, returnTo: safeReturnPath(parsed.returnTo) }
      : null;
  } catch {
    return null;
  }
}

/** Opens Facebook's login popup and resolves with an access_token. */
export async function getFacebookAccessToken(): Promise<string> {
  if (!FACEBOOK_APP_ID) {
    throw new Error("Facebook login is not configured (NEXT_PUBLIC_FACEBOOK_APP_ID is missing).");
  }

  if (!window.FB) {
    await new Promise<void>((resolve) => {
      window.fbAsyncInit = () => {
        window.FB!.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: "v21.0" });
        resolve();
      };
      loadScript("https://connect.facebook.net/en_US/sdk.js", "facebook-jssdk");
    });
  }

  return new Promise((resolve, reject) => {
    window.FB!.login(
      (response) => {
        if (response.status !== "connected" || !response.authResponse) {
          reject(new Error("Facebook login was cancelled."));
          return;
        }
        resolve(response.authResponse.accessToken);
      },
      { scope: "public_profile,email" },
    );
  });
}
