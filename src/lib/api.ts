import { ApiError, NETWORK_ERROR_STATUS, type ApiErrorPayload } from "./api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://apix.bigpoint.com.bd";

/** Same-origin route that forwards browser requests to the backend (see src/app/api/proxy). */
const PROXY_PREFIX = "/api/proxy";
// const PROXY_PREFIX = "ap-southeast-1.amazonaws.com";
// const PROXY_PREFIX = "/amazonaws";
// const PROXY_PREFIX = "/aws/proxy";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
  apiKey?: string;
  isRetry?: boolean;
  /**
   * Skips the auto-refresh-then-"session expired" flow on a 401. For calls
   * that are ALLOWED to run without a valid session (e.g. a payment-gateway
   * return page visited by a guest) — without this, a plain "not logged in"
   * 401 forces the site-wide SessionExpiredModal ("log out and log in
   * again") onto a page that has nothing to do with an actual expired
   * session, purely because it happens to call a tokenized endpoint.
   */
  suppressSessionExpired?: boolean;
  /**
   * Aborts the request after this many milliseconds instead of letting it
   * hang forever on a stalled connection (the real cause behind the
   * "TypeError: fetch failed" / ETIMEDOUT hangs seen in production — an
   * unbounded fetch ties up memory/connections for as long as the backend
   * stays silent). Ignored if `signal` is already set explicitly.
   * Default: 10s — every ordinary JSON GET/POST in this app should finish
   * well inside that. Bump this per-call for known-slow, known-necessary
   * requests (e.g. the sitemap route's full-catalog page fetches, or a
   * multipart file upload) rather than raising the default and weakening
   * the guard for every other call.
   */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Resolves the URL a request should actually hit.
 *
 * - In the browser: always go through the same-origin `/api/proxy/...` route, so the
 *   real backend host never appears in the Network tab (this includes auth endpoints).
 * - On the server: call the backend directly — nothing is exposed to the client, and
 *   this avoids a pointless extra hop through our own server.
 */
function resolveUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint;

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (typeof window !== "undefined") return `${PROXY_PREFIX}${path}`;

  return `${BASE_URL}${path}`;
}

let isRefreshing = false;
let refreshPromise: Promise<{ apiKey: string; token: string } | null> | null = null;

function getAuthCredentials(): { apiKey: string | null; token: string | null } {
  if (typeof window === "undefined") return { apiKey: null, token: null };

  let token = localStorage.getItem("token");
  let apiKey = localStorage.getItem("apiKey");

  if (!token || !apiKey) {
    try {
      const persisted = localStorage.getItem("persist:dazzle_auth");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (!token && parsed.token) token = JSON.parse(parsed.token);
        if (!apiKey && parsed.apiKey) apiKey = JSON.parse(parsed.apiKey);
      }
    } catch {}
  }

  return { apiKey, token };
}

/**
 * `suppressEvent` skips only the "session-expired" DOM event (the one
 * SessionExpiredModal listens for) — credentials are still cleared and the
 * user is still logged out in Redux either way. Used by pages a guest can
 * legitimately land on (payment-gateway returns) so an expired/missing
 * session doesn't force the intrusive "log out and log in again" modal onto
 * someone just checking whether their payment went through.
 */
function triggerSessionExpired(suppressEvent = false) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("apiKey");
      import("@/store/store").then(({ store }) => {
        import("@/store/slices/authSlice").then(({ logout }) => {
          store.dispatch(logout());
        });
      });
    } catch {}
    if (!suppressEvent) {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }
  }
}

async function refreshJwtToken(suppressEvent = false): Promise<{ apiKey: string; token: string } | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { apiKey, token } = getAuthCredentials();
      if (!apiKey || !token) {
        triggerSessionExpired(suppressEvent);
        return null;
      }

      const formattedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      // Routed through resolveUrl so this auth call also stays behind the proxy in the browser.
      const res = await fetch(resolveUrl("/refresh-jwt-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "Authorization": formattedToken,
        },
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok && responseData?.statusCode === 200 && responseData?.data) {
        const newApiKey = responseData.data["x-api-key"] || apiKey;
        const newToken = responseData.data.Authorization || responseData.data.authorization || token;

        if (typeof window !== "undefined") {
          localStorage.setItem("apiKey", newApiKey);
          localStorage.setItem("token", newToken);
        }

        try {
          const { store } = await import("@/store/store");
          const { setCredentials } = await import("@/store/slices/authSlice");
          const currentUser = store.getState().auth.user || {
            usersCommuuid: "",
            userFullName: "",
            email: "",
            emailVerifiedToken: "",
            createdAt: new Date().toISOString(),
          };
          store.dispatch(
            setCredentials({
              user: currentUser,
              apiKey: newApiKey,
              token: newToken,
            })
          );
        } catch {}

        return { apiKey: newApiKey, token: newToken };
      } else {
        triggerSessionExpired(suppressEvent);
        return null;
      }
    } catch {
      triggerSessionExpired(suppressEvent);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * API Fetch Helper
 * Works on both server-side (SSR/Server Components) and client-side (Client Components).
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    params,
    token: explicitToken,
    apiKey: explicitApiKey,
    isRetry,
    suppressSessionExpired,
    timeoutMs,
    headers: customHeaders,
    ...customOptions
  } = options;

  // 1. Build URL with query params
  let url = resolveUrl(endpoint);

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 2. Setup standard headers
  const headers = new Headers(customHeaders);
  if (!headers.has("Content-Type") && !(customOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Authorization & X-API-Key handling
  const { apiKey: storedApiKey, token: storedToken } = getAuthCredentials();
  const activeToken = explicitToken || storedToken;
  const activeApiKey = explicitApiKey || storedApiKey;

  if (activeToken) {
    headers.set("Authorization", activeToken.startsWith("Bearer ") ? activeToken : `Bearer ${activeToken}`);
  } else if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const serverToken = cookieStore.get("token")?.value;
      if (serverToken) {
        headers.set("Authorization", serverToken.startsWith("Bearer ") ? serverToken : `Bearer ${serverToken}`);
      }
    } catch {}
  }

  if (activeApiKey) {
    headers.set("X-API-Key", activeApiKey);
  }

  // 4. Perform the fetch request with SSR retry for ECONNRESET
  const fetchConfig = {
    ...customOptions,
    headers,
  };

  const MAX_RETRIES = typeof window === "undefined" ? 2 : 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // A fresh timeout budget per attempt — bounds how long any single
      // attempt can hang on a stalled connection, instead of waiting
      // forever (the actual cause behind ETIMEDOUT / "fetch failed" tying up
      // memory on a request the backend never answers). Only applied when
      // the caller hasn't already supplied their own `signal`.
      const response = await fetch(url, {
        ...fetchConfig,
        signal: fetchConfig.signal ?? AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });

      // 5. Handle 401 Unauthorized / Token Expiration for client requests
      const isAuthEndpoint =
        endpoint.includes("refresh-jwt-token") ||
        endpoint.includes("login-with-mobile") ||
        endpoint.includes("login-mobile-otp") ||
        endpoint.includes("user-login");

      if (
        response.status === 401 &&
        !isRetry &&
        !isAuthEndpoint &&
        typeof window !== "undefined"
      ) {
        // Always attempt the silent refresh — even for calls that suppress
        // the session-expired UI, a still-refreshable token should still be
        // renewed and the request retried; suppression only controls whether
        // a refresh that FAILS shows the modal (see refreshJwtToken).
        const refreshed = await refreshJwtToken(suppressSessionExpired);
        if (refreshed) {
          return apiFetch<T>(endpoint, {
            ...options,
            token: refreshed.token,
            apiKey: refreshed.apiKey,
            isRetry: true,
          });
        }
      }

      if (!response.ok) {
        let errorData: ApiErrorPayload = {};
        try {
          errorData = (await response.json()) as ApiErrorPayload;
        } catch {
          errorData = { message: response.statusText, statusCode: response.status };
        }
        // Guarantee the payload always carries a status code, even if the API omits it.
        if (errorData.statusCode === undefined) {
          errorData.statusCode = response.status;
        }

        // If error message indicates JWT token expired on non-auth endpoint
        const msg = String(errorData.message || "").toLowerCase();
        if (
          (response.status === 401 || msg.includes("jwt token has expired")) &&
          !isRetry &&
          !isAuthEndpoint &&
          typeof window !== "undefined"
        ) {
          const refreshed = await refreshJwtToken(suppressSessionExpired);
          if (refreshed) {
            return apiFetch<T>(endpoint, {
              ...options,
              token: refreshed.token,
              apiKey: refreshed.apiKey,
              isRetry: true,
            });
          }
        }

        // ApiError keeps `message` as the JSON payload, so existing
        // `JSON.parse(err.message)` call sites continue to work unchanged.
        throw new ApiError(response.status, errorData, endpoint);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json() as Promise<T>;
    } catch (err) {
      lastError = err;

      if (err instanceof ApiError) {
        // A definitive client error (404, 400, 422, ...) — retrying would
        // just repeat the same failure. Fail immediately so the caller's own
        // try/catch can fall back to empty/default data right away instead
        // of wasting extra round trips on a request that can never succeed.
        if (!err.isRetryable || attempt === MAX_RETRIES) {
          throw err;
        }
        // Retryable HTTP response (408 timeout, 429 rate-limited, 5xx server
        // error) — treat like a transient network error and retry.
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      // "TimeoutError" is what our own AbortSignal.timeout() above throws
      // when the backend never answers in time — treated the same as a
      // dropped connection, since neither reached a real HTTP response.
      const isConnReset =
        err instanceof Error &&
        (err.name === "TimeoutError" ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("fetch failed"));

      if (!isConnReset || attempt === MAX_RETRIES) {
        throw new ApiError(
          NETWORK_ERROR_STATUS,
          { message: err instanceof Error ? (err.name === "TimeoutError" ? "Request timed out." : err.message) : String(err) },
          endpoint
        );
      }

      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Unreachable in practice (the loop always returns or throws), but keeps the
  // contract that apiFetch only ever rejects with an ApiError.
  throw new ApiError(
    NETWORK_ERROR_STATUS,
    { message: lastError instanceof Error ? lastError.message : String(lastError) },
    endpoint
  );
}

// Re-exported so consumers can do everything from a single import:
//   import { api, getApiErrorMessage } from "@/lib/api";
export {
  ApiError,
  isApiError,
  toApiError,
  getApiErrorMessage,
  getApiErrorList,
} from "./api-error";
export type { ApiErrorPayload } from "./api-error";

// Convenient wrappers for HTTP methods
export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  /** `body` is optional — most DELETEs identify the resource via the URL, but some (e.g. wishlist-remove) require a JSON body instead. */
  delete: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "DELETE",
      ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    }),
};
