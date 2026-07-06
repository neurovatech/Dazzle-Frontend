const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://apix.bigpoint.com.bd";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
}

/**
 * API Fetch Helper
 * Works on both server-side (SSR/Server Components) and client-side (Client Components).
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, token, headers: customHeaders, ...customOptions } = options;

  // 1. Build URL with query params
  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
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

  // 3. Authorization Token handling
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    // Attempt auto-token resolution
    if (typeof window === "undefined") {
      // Server-side: Import and read cookies dynamically
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const serverToken = cookieStore.get("token")?.value;
        if (serverToken) {
          headers.set("Authorization", `Bearer ${serverToken}`);
        }
      } catch (err) {
        // cookies() might fail if not inside a request context (e.g. during static generation)
      }
    } else {
      // Client-side: Read token from document cookies or localStorage
      const clientToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (clientToken) {
        headers.set("Authorization", `Bearer ${clientToken}`);
      } else {
        const storageToken = localStorage.getItem("token");
        if (storageToken) {
          headers.set("Authorization", `Bearer ${storageToken}`);
        }
      }
    }
  }

  // 4. Perform the fetch request with SSR retry for ECONNRESET
  const fetchConfig = {
    ...customOptions,
    headers,
  };

  // SSR-এ network blip হলে max 2 বার retry করবে
  const MAX_RETRIES = typeof window === "undefined" ? 2 : 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, fetchConfig);

      // 5. Handle response and errors
      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = (await response.json()) as Record<string, unknown>;
        } catch {
          errorData = { message: response.statusText };
        }
        throw new Error(JSON.stringify(errorData));
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json() as Promise<T>;
    } catch (err) {
      lastError = err;
      const isConnReset =
        err instanceof Error &&
        (err.message.includes("ECONNRESET") ||
          err.message.includes("fetch failed"));

      // Retry শুধু ECONNRESET বা network error-এর জন্য, last attempt-এও fail করলে throw
      if (!isConnReset || attempt === MAX_RETRIES) {
        throw err;
      }

      // Retry-এর আগে সামান্য wait (300ms)
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  throw lastError;
}

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
