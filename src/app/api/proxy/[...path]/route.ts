import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL || "https://apix.bigpoint.com.bd";

// Auth tokens and per-user data flow through here — never cache or statically optimise it.
export const dynamic = "force-dynamic";

/**
 * Public catalog reads only — never anything that can carry per-user data.
 * Combined with the "no Authorization header" check below (belt-and-braces:
 * even a request to one of these prefixes that DOES carry a token skips
 * caching), this lets the browser's own HTTP cache absorb repeat requests
 * from client components that call these endpoints on every page-view/scroll
 * (categories list, new-arrivals/showcase pagination, quick-view, testimonials)
 * — confirmed live that the real backend sends no Cache-Control of its own,
 * so without this those requests always hit the backend fresh.
 */
const PUBLIC_CACHEABLE_PREFIXES = [
  "categories",
  "products",
  "showcase-items",
  "product/",
  "product-variants/",
  "testimonials/",
];

function isPublicCacheableGet(subPath: string, method: string, hasAuth: boolean): boolean {
  if (method !== "GET" || hasAuth) return false;
  return PUBLIC_CACHEABLE_PREFIXES.some((prefix) => subPath.startsWith(prefix));
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const subPath = path.join("/");
  const searchParams = request.nextUrl.search;
  const targetUrl = `${BASE_URL}/${subPath}${searchParams}`;

  // Clone headers
  const headers = new Headers(request.headers);
  
  // Remove Host header to prevent destination mismatches
  headers.delete("host");
  // Set correct connection state
  headers.set("connection", "keep-alive");

  // Remove browser-specific headers that can cause backend to block or redirect requests (CORS/referer protection)
  headers.delete("origin");
  headers.delete("referer");
  headers.delete("sec-fetch-dest");
  headers.delete("sec-fetch-mode");
  headers.delete("sec-fetch-site");
  headers.delete("sec-fetch-user");
  headers.delete("sec-ch-ua");
  headers.delete("sec-ch-ua-mobile");
  headers.delete("sec-ch-ua-platform");

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      // Bounds how long any proxied request can hang on a stalled backend
      // connection — without this, a silent backend (ETIMEDOUT) left the
      // request (and its memory) pending indefinitely instead of failing
      // and freeing up.
      signal: AbortSignal.timeout(30_000),
    };

    // Forward request body if applicable
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      } else if (contentType.includes("multipart/form-data")) {
        fetchOptions.body = await request.formData();
        // The re-parsed FormData gets a brand-new boundary — and therefore a
        // different byte length — when fetch serializes it again. Forwarding
        // the browser's original content-type leaves a stale boundary the
        // backend can't parse fields against, and forwarding the original
        // content-length throws RequestContentLengthMismatchError the moment
        // the new body's real length differs from it (verified live: it always
        // does). Dropping both lets fetch compute correct fresh values for the
        // new body.
        headers.delete("content-type");
        headers.delete("content-length");
      } else {
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Build response headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    // Strip headers that would reveal the backend host or stack to the browser.
    responseHeaders.delete("server");
    responseHeaders.delete("x-powered-by");
    responseHeaders.delete("access-control-allow-origin");

    // Rewrite redirects so the real backend URL never reaches the Network tab.
    const location = responseHeaders.get("location");
    if (location && location.startsWith(BASE_URL)) {
      responseHeaders.set("location", `/api/proxy${location.slice(BASE_URL.length)}`);
    }

    // Let the browser's own HTTP cache absorb repeat public-catalog reads —
    // see isPublicCacheableGet's comment. Only for a genuinely anonymous GET
    // to a known-public prefix, and only on success; never overrides a
    // Cache-Control the backend itself already set.
    if (
      response.ok &&
      !responseHeaders.has("cache-control") &&
      isPublicCacheableGet(subPath, request.method, headers.has("authorization"))
    ) {
      responseHeaders.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
    }

    // Streamed straight through instead of buffered with arrayBuffer() —
    // every request from every visitor passes through this one route, so
    // holding each full response body in memory before forwarding it adds
    // needless per-request memory/GC pressure at real concurrency. Streaming
    // also lets the browser start receiving bytes immediately instead of
    // waiting for the whole backend response first.
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error for:", targetUrl, error);
    return NextResponse.json(
      { message: "Failed to connect to backend server" },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = handleProxy;
