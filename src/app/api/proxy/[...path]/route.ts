import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const BASE_URL = "https://apix.bigpoint.com.bd";

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
      } else {
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    try {
      const cloneResponse = response.clone();
      const text = await cloneResponse.text();
      const logMsg = `[${new Date().toISOString()}] REQUEST: ${request.method} ${request.nextUrl.pathname} -> TARGET: ${targetUrl}\n` +
                     `RESPONSE STATUS: ${response.status}\n` +
                     `RESPONSE BODY (first 200 chars): ${text.substring(0, 200)}\n\n`;
      fs.appendFileSync("d:\\dulal-work\\dazzle\\proxy-log.txt", logMsg);
    } catch (e) {
      console.error("Failed to write proxy log:", e);
    }

    // Build response headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    const data = await response.arrayBuffer();

    return new NextResponse(data, {
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
