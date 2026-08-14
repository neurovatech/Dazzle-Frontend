/**
 * Centralised API error handling.
 *
 * The backend returns errors in this shape:
 *   { statusCode: 422, status: "error", message: "Validation failed", errors: ["Email is required"] }
 *
 * IMPORTANT (backwards compatibility):
 * `ApiError.message` is intentionally kept as the JSON-stringified payload,
 * because existing call sites across the app do `JSON.parse(err.message)`.
 * Do NOT show `error.message` directly to a user — use `getApiErrorMessage()`
 * or `getApiErrorList()` instead, which always return clean, human-readable text.
 */

export interface ApiErrorPayload {
  statusCode?: number;
  status?: string;
  message?: string;
  errors?: string[];
  [key: string]: unknown;
}

/** Network/offline failures get this status so they can be told apart from HTTP errors. */
export const NETWORK_ERROR_STATUS = 0;

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/** Human-readable fallbacks per HTTP status, used when the API sends no usable message. */
function defaultMessageForStatus(status: number): string {
  if (status === NETWORK_ERROR_STATUS)
    return "Cannot reach the server. Please check your internet connection and try again.";
  if (status === 400) return "The request was invalid. Please check your input and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested information could not be found.";
  if (status === 408) return "The request timed out. Please try again.";
  if (status === 409) return "This action conflicts with existing data.";
  if (status === 413) return "The file you are uploading is too large.";
  if (status === 422) return "Please correct the highlighted fields and try again.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "The server is temporarily unavailable. Please try again shortly.";
  return DEFAULT_MESSAGE;
}

export class ApiError extends Error {
  /** HTTP status code, or NETWORK_ERROR_STATUS (0) when the request never reached the server. */
  readonly status: number;
  /** Full parsed error body returned by the API. */
  readonly payload: ApiErrorPayload;
  /** Field-level validation errors, always an array (empty when there are none). */
  readonly errors: string[];
  /** The endpoint that produced this error — useful for logging/telemetry. */
  readonly endpoint?: string;

  constructor(status: number, payload: ApiErrorPayload = {}, endpoint?: string) {
    // Keep the JSON string as `message` so existing `JSON.parse(err.message)` call sites keep working.
    super(JSON.stringify(payload));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.errors = Array.isArray(payload.errors) ? payload.errors.filter(Boolean) : [];
    this.endpoint = endpoint;

    // Required so `instanceof ApiError` works reliably after transpilation.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** True when the request never reached the server (offline, DNS failure, connection reset). */
  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }

  /** True when the session is invalid/expired and the user should re-authenticate. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** True for validation failures that usually map onto specific form fields. */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400 || this.errors.length > 0;
  }

  /** True when retrying later has a reasonable chance of succeeding. */
  get isRetryable(): boolean {
    return this.isNetworkError || this.status === 408 || this.status === 429 || this.status >= 500;
  }

  /** Clean, user-displayable message. Never returns raw JSON. */
  get friendlyMessage(): string {
    if (this.errors.length > 0) return this.errors.join(", ");
    const apiMessage = typeof this.payload.message === "string" ? this.payload.message.trim() : "";
    // Guard against the API echoing back a JSON blob or an empty string.
    if (apiMessage && !apiMessage.startsWith("{") && !apiMessage.startsWith("[")) {
      return apiMessage;
    }
    return defaultMessageForStatus(this.status);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Normalises ANY thrown value into an ApiError.
 * Handles ApiError, legacy `new Error(JSON.stringify(payload))`, plain Errors, and unknown throws.
 */
export function toApiError(error: unknown, endpoint?: string): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof Error) {
    // Legacy shape: message is a JSON-stringified API payload.
    try {
      const parsed = JSON.parse(error.message) as ApiErrorPayload;
      if (parsed && typeof parsed === "object") {
        return new ApiError(Number(parsed.statusCode) || NETWORK_ERROR_STATUS, parsed, endpoint);
      }
    } catch {
      // Not JSON — fall through and treat as a transport/runtime failure.
    }
    return new ApiError(NETWORK_ERROR_STATUS, { message: error.message }, endpoint);
  }

  return new ApiError(NETWORK_ERROR_STATUS, { message: String(error) }, endpoint);
}

/**
 * Returns a clean, user-facing message for any thrown value.
 * Use this instead of `error.message` when showing errors in toasts or the UI.
 */
export function getApiErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  const apiError = toApiError(error);
  const message = apiError.friendlyMessage;
  return message || fallback;
}

/**
 * Returns the list of field-level validation errors for any thrown value.
 * Falls back to a single-item array containing the general message when the
 * API did not provide a structured `errors` array.
 */
export function getApiErrorList(error: unknown, fallback = DEFAULT_MESSAGE): string[] {
  const apiError = toApiError(error);
  if (apiError.errors.length > 0) return apiError.errors;
  return [apiError.friendlyMessage || fallback];
}
