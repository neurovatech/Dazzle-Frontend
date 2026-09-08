"use client";

import { useWishlistSync } from "@/hooks/useWishlist";

/** Mounted once, sitewide (root layout) — keeps redux's wishlist.items in sync with the account's real server-side wishlist. */
export default function WishlistSync() {
  useWishlistSync();
  return null;
}
