"use client";

/**
 * Client-side token acquisition for "Continue with Google/Facebook".
 *
 * Deliberately NOT a redirect-based OAuth flow (no /auth/google/callback
 * route needed on our side). Both providers' own JS SDKs open their popup,
 * hand back a token in-browser, and we send just that token to our backend
 * in one POST — the backend verifies it directly with Google/Facebook's own
 * servers rather than us running a redirect dance. See
 * docs/social-login-backend-requirements.txt for the backend half.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken: () => void };
        };
      };
    };
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

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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

/** Opens Google's consent popup and resolves with an OAuth access_token. */
export async function getGoogleAccessToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google login is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing).");
  }

  await loadScript("https://accounts.google.com/gsi/client", "google-identity-script");

  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Identity Services failed to load."));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || "Google login was cancelled."));
          return;
        }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
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
