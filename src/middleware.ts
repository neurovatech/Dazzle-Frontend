import { NextResponse, type NextRequest } from "next/server";

/**
 * bKash's real payment callback concatenates the order reference directly
 * onto the path with NO separator — observed in production:
 *
 *   /bkash-verify229e9097-d048-444e-8c22-436a8d57dd91?paymentID=...&status=cancel
 *
 * — instead of the `/bkash-verify?orderNo=...` shape asked of the backend
 * (see docs/payment-callback-pages-backend-contract.txt, which still
 * flags this as something to fix on their end). Next.js file-system
 * routing has no way to match "static text immediately followed by a
 * dynamic value in the same segment", so the malformed URL would 404
 * outright without this: it rewrites the request to the real
 * `/bkash-verify` page with the order reference moved into a proper
 * `orderNo` query param, before the App Router ever tries to match a route
 * against it. The browser's own address bar is untouched — this is a
 * server-side rewrite, not a redirect.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const match = pathname.match(/^\/bkash-verify(.+)$/);
  if (!match) return NextResponse.next();

  const orderUuid = decodeURIComponent(match[1]).replace(/\/+$/, "");
  if (!orderUuid) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/bkash-verify";
  const params = new URLSearchParams(search);
  if (!params.has("orderNo")) {
    params.set("orderNo", orderUuid);
  }
  url.search = params.toString();

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
