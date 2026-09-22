import { NextResponse, type NextRequest } from "next/server";

/**
 * bKash's real payment callback used to concatenate the order reference
 * directly onto the path with NO separator — observed in production:
 *
 *   /bkash-verify229e9097-d048-444e-8c22-436a8d57dd91?paymentID=...&status=cancel
 *
 * — instead of a proper path segment (see
 * docs/payment-callback-pages-backend-contract.txt). Next.js file-system
 * routing has no way to match "static text immediately followed by a
 * dynamic value in the same segment", so that malformed shape would 404
 * outright without this: it rewrites the request to the flat `/bkash-verify`
 * page with the order reference moved into a proper `orderNo` query param,
 * before the App Router ever tries to match a route against it. The
 * browser's own address bar is untouched — this is a server-side rewrite,
 * not a redirect.
 *
 * The backend has since started sending a real `/` separator
 * (`/bkash-verify/{orderToken}`), which src/app/bkash-verify/[orderToken]/
 * now handles as a proper dynamic route — so this rewrite only fires when
 * the segment right after "bkash-verify" is NOT a "/", i.e. still the old
 * malformed shape. A well-formed `/bkash-verify/{token}` request is left
 * alone and reaches the real route.
 *
 * The same guard covers `/bkash-verify-partial` (the "Pay Due Amount"
 * partial-payment callback added alongside it) in case the backend
 * redirects there with the same malformed shape — this rewrite falls back
 * to `?orderNo=` on that page too, but note that page ALSO needs the real
 * orderToken as a proper `/bkash-verify-partial/{orderToken}` path segment
 * to call its verify endpoint, so this fallback only helps the malformed
 * case get a real order number for the /order-tracking-less partial screen,
 * not a substitute for a proper path segment.
 *
 * Checked longest-prefix-first with plain `startsWith`, NOT a single regex
 * with an optional `(?:-partial)?` group — a well-formed
 * `/bkash-verify-partial/{token}` request made the base group's "-partial"
 * optional under backtracking: when matching failed at the `/` after the
 * long base, the regex engine retried with the SHORT base ("bkash-verify"),
 * under which "-partial/{token}" itself looked like the glued-on malformed
 * shape and got wrongly rewritten to `/bkash-verify?orderNo=-partial/...` —
 * landing well-formed partial-payment requests on the full-payment page.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  for (const base of ["bkash-verify-partial", "bkash-verify"]) {
    const prefix = `/${base}`;
    if (!pathname.startsWith(prefix)) continue;

    const rest = pathname.slice(prefix.length);
    // Empty (bare "/bkash-verify[-partial]") or a real "/" separator —
    // both are well-formed and reach the actual route unmodified.
    if (rest === "" || rest.startsWith("/")) return NextResponse.next();

    const orderUuid = decodeURIComponent(rest).replace(/\/+$/, "");
    if (!orderUuid) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = prefix;
    const params = new URLSearchParams(search);
    if (!params.has("orderNo")) {
      params.set("orderNo", orderUuid);
    }
    url.search = params.toString();

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
