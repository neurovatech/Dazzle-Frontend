import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand cache purge.
 *
 * Pages cache their API data for 60s, so a catalogue edit normally appears
 * within a minute. Call this endpoint from the admin/backend right after a save
 * to publish the change immediately instead of waiting that window out.
 *
 *   POST /api/revalidate
 *   x-revalidate-secret: <REVALIDATE_SECRET>
 *   { "tag": "product:apple-iphone-18-pro-max" }
 *
 * Accepted body fields (any combination):
 *   tag  | tags  — cache tag(s) to purge, e.g. "product", "product:<slug>"
 *   path | paths — route path(s) to purge, e.g. "/product/apple-iphone-18-pro-max"
 *
 * Purging the bare "product" tag refreshes every product page at once; use a
 * "product:<slug>" tag to refresh just one.
 *
 * The endpoint is disabled unless REVALIDATE_SECRET is set, so an unconfigured
 * deployment cannot have its cache flushed by anyone who finds the URL.
 */

function toList(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && !!v.trim());
  }
  return [];
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "REVALIDATE_SECRET is not configured on the server.",
      },
      { status: 503 },
    );
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const tags = [...toList(body.tag), ...toList(body.tags)];
  const paths = [...toList(body.path), ...toList(body.paths)];

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Provide at least one of: tag, tags, path, paths.",
      },
      { status: 400 },
    );
  }

  // Next.js 16 requires a cache-life profile alongside the tag; { expire: 0 }
  // means "serve nothing stale", i.e. purge now.
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    now: Date.now(),
  });
}
