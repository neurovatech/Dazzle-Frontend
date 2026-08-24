import { ApiError, NETWORK_ERROR_STATUS, type ApiErrorPayload } from "./api-error";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://apix.bigpoint.com.bd";

/** Same-origin route that forwards browser requests to the backend (see src/app/api/proxy). */
// const PROXY_PREFIX = "/api/proxy";
// const PROXY_PREFIX = "ap-southeast-1.amazonaws.com";
const PROXY_PREFIX = "/amazonaws";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
  apiKey?: string;
  isRetry?: boolean;
}

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

function triggerSessionExpired() {
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
    window.dispatchEvent(new CustomEvent("session-expired"));
  }
}

async function refreshJwtToken(): Promise<{ apiKey: string; token: string } | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { apiKey, token } = getAuthCredentials();
      if (!apiKey || !token) {
        triggerSessionExpired();
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
        triggerSessionExpired();
        return null;
      }
    } catch {
      triggerSessionExpired();
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
  const { params, token: explicitToken, apiKey: explicitApiKey, isRetry, headers: customHeaders, ...customOptions } = options;

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
      const response = await fetch(url, fetchConfig);

      // 5. Handle 401 Unauthorized / Token Expiration for client requests
      const isAuthEndpoint =
        endpoint.includes("refresh-jwt-token") ||
        endpoint.includes("login-with-mobile") ||
        endpoint.includes("login-mobile-otp") ||
        endpoint.includes("user-login");

      if (response.status === 401 && !isRetry && !isAuthEndpoint && typeof window !== "undefined") {
        const refreshed = await refreshJwtToken();
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
          const refreshed = await refreshJwtToken();
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

      // A real HTTP response came back — retrying would just repeat the same failure.
      if (err instanceof ApiError && !err.isNetworkError) {
        throw err;
      }

      const isConnReset =
        err instanceof Error &&
        (err.message.includes("ECONNRESET") ||
          err.message.includes("fetch failed"));

      if (!isConnReset || attempt === MAX_RETRIES) {
        throw new ApiError(
          NETWORK_ERROR_STATUS,
          { message: err instanceof Error ? err.message : String(err) },
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

  delete: <T = unknown>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
