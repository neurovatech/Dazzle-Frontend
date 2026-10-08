import { NextResponse } from "next/server";

/**
 * GET /api/meta/health
 *
 * Status of the Meta catalog feed, passed through from the .NET backend:
 *
 *     { "status": "not_configured", "lastFeedBuildUtc": null,
 *       "itemsExported": 0, "itemsSkipped": 0 }
 *
 * No authentication — same as the backend endpoint (it exposes only a status
 * word and counters, nothing about products or secrets).
 *
 * Env (server-only):
 *   META_HEALTH_UPSTREAM_URL  backend health URL. Defaults to
 *                             ${API_BASE_URL}/api/meta/health.
 */
export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.API_BASE_URL || "https://apix.bigpoint.com.bd";
const UPSTREAM_URL = process.env.META_HEALTH_UPSTREAM_URL || `${API_BASE_URL}/api/meta/health`;

export async function GET() {
  try {
    const upstream = await fetch(UPSTREAM_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      console.error(`[MetaHealth] upstream returned HTTP ${upstream.status}`);
      return unavailable();
    }

    const type = upstream.headers.get("content-type") || "";
    if (!/json/i.test(type)) {
      // An HTML WAF/login page is not a health report.
      console.error(`[MetaHealth] upstream did not return JSON (content-type: "${type}")`);
      return unavailable();
    }

    const body = await upstream.json();
    return NextResponse.json(body, {
      status: 200,
      // A status endpoint is only useful if it is current.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[MetaHealth] failed to fetch the upstream health:", error);
    return unavailable();
  }
}

function unavailable() {
  return NextResponse.json(
    { status: "unavailable" },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}
