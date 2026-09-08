"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setWishlist,
  removeFromWishlist as removeFromWishlistLocal,
  recordWishListUuid,
} from "@/store/slices/wishlistSlice";
import type { WishlistItem } from "@/store/slices/wishlistSlice";
import {
  addToWishlistApi,
  getWishlistApi,
  removeFromWishlistApi,
  type WishlistProduct,
} from "@/lib/wishlistApi";
import { trackAddToWishlist } from "@/lib/analytics/pixelEvents";
import { getApiErrorList } from "@/lib/api";

/** GET /wishlist-get's item shape → the redux WishlistItem shape used everywhere on screen. */
function mapServerItem(p: WishlistProduct): WishlistItem {
  const price = p.discountedPrice > 0 ? p.discountedPrice : p.regularPrice;
  return {
    productUuid: p.productUuid,
    productName: p.productName,
    productSlug: p.productSlug,
    image: p.thumbnails?.mediaFileUrl || "",
    price,
    originalPrice: p.regularPrice,
    discount: p.disRate,
    badge: p.productBadge,
    inStock: !p.isTba,
    isBestDeal: false,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Fetches the account's real wishlist (GET /wishlist-get, capped at the
 * backend's own 20-item limit) and mirrors it into redux — mount this ONCE,
 * sitewide (see WishlistSync in the root layout). Every wishlist button
 * across the app keeps reading `state.wishlist.items` exactly as before;
 * this is just what keeps that redux state truthful to the server.
 */
export function useWishlistSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wishListUuidByProduct = useAppSelector((s) => s.wishlist.wishListUuidByProduct);

  const { data } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlistApi({ limit: 20, order: "new" }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    if (data?.data) {
      // GET doesn't echo back wishListUuid per item — re-attach it from the
      // durable local record (set at add-time) so "remove" keeps working
      // for these items after this sync overwrites `items` wholesale.
      dispatch(
        setWishlist(
          data.data.map((p) => ({
            ...mapServerItem(p),
            wishListUuid: wishListUuidByProduct[p.productUuid],
          })),
        ),
      );
    }
    // wishListUuidByProduct deliberately excluded: it should only be
    // re-applied when the server list itself changes, not every time a new
    // id is recorded (that would fight with the optimistic update add/remove
    // already make to `items` directly).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isAuthenticated, dispatch]);
}

/**
 * The one function every "add to wishlist" button in the app should call.
 * Requires a resolved variantUuid — see the call sites for how each one
 * gets it (product pages already have a selected/resolved variant; listing
 * cards resolve a default variant first via /get-default-variant, same as
 * their "Add to Cart" buttons already do).
 */
export function useAddToWishlist() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const queryClient = useQueryClient();
  const [pendingProductUuid, setPendingProductUuid] = useState<string | null>(null);

  const addToWishlist = useCallback(
    async (params: {
      productUuid: string;
      variantUuid: string;
      name: string;
      price: number;
    }): Promise<boolean> => {
      if (!isAuthenticated) {
        toast.error("Please log in to save items to your wishlist.");
        return false;
      }
      if (!params.productUuid || !params.variantUuid) {
        // Nothing to send — a card whose variant failed to resolve. Fail
        // quietly rather than firing a request guaranteed to 400.
        toast.error("Could not identify this product's variant.");
        return false;
      }

      setPendingProductUuid(params.productUuid);
      try {
        const res = await addToWishlistApi({
          productUuid: params.productUuid,
          variantUuid: params.variantUuid,
        });

        if (res.statusCode === 200 && res.status === "success") {
          toast.success(res.message || "Added to wishlist!");
          trackAddToWishlist({ id: params.productUuid, name: params.name, price: params.price });
          if (res.data?.wishListUuid) {
            // Recorded BEFORE the refetch below so useWishlistSync's effect
            // can re-attach it once the server list comes back without it.
            dispatch(
              recordWishListUuid({
                productUuid: params.productUuid,
                wishListUuid: res.data.wishListUuid,
              }),
            );
          }
          // Re-fetch from the server rather than optimistically guessing the
          // new item's shape — keeps redux exactly in sync with the account.
          await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
          return true;
        }

        toast.error(res.message || "Could not add to wishlist.");
        return false;
      } catch (err) {
        // Covers every documented failure: 400 validation, 400 invalid
        // variant, 404 product not found, 409 duplicate, 409 limit reached.
        // 401 is already handled globally by api.ts's token-refresh/
        // session-expired flow before it ever reaches here.
        getApiErrorList(err).forEach((m) => toast.error(m));
        return false;
      } finally {
        setPendingProductUuid(null);
      }
    },
    [isAuthenticated, queryClient, dispatch],
  );

  return {
    addToWishlist,
    /** True while a request for this specific productUuid is in flight — use to disable just that button, not every wishlist button on the page. */
    isAdding: (productUuid: string) => pendingProductUuid === productUuid,
  };
}

/**
 * The one function every "remove from wishlist" button should call.
 *
 * Needs the entry's wishListUuid, not its productUuid — pass whatever
 * `state.wishlist.items` has on that item's `wishListUuid` field. It won't
 * be there for an item this browser never itself added (GET /wishlist-get
 * doesn't return it) — that case still degrades to a local-only removal so
 * the button never just does nothing, but it won't persist server-side.
 */
export function useRemoveFromWishlist() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [pendingProductUuid, setPendingProductUuid] = useState<string | null>(null);

  const removeFromWishlist = useCallback(
    async (params: { productUuid: string; wishListUuid?: string }): Promise<boolean> => {
      if (!params.wishListUuid) {
        // No id to delete by (item came from a GET sync, not an add this
        // browser made) — hide it locally rather than leaving the button inert.
        dispatch(removeFromWishlistLocal(params.productUuid));
        toast.success("Removed from wishlist.");
        return true;
      }

      setPendingProductUuid(params.productUuid);
      try {
        const res = await removeFromWishlistApi(params.wishListUuid);
        if (res.statusCode === 200 && res.status === "success") {
          dispatch(removeFromWishlistLocal(params.productUuid));
          toast.success(res.message || "Removed from wishlist.");
          await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
          return true;
        }
        toast.error(res.message || "Could not remove from wishlist.");
        return false;
      } catch (err) {
        // 400 validation, 404 not found — 401 handled globally by api.ts.
        getApiErrorList(err).forEach((m) => toast.error(m));
        return false;
      } finally {
        setPendingProductUuid(null);
      }
    },
    [dispatch, queryClient],
  );

  return {
    removeFromWishlist,
    isRemoving: (productUuid: string) => pendingProductUuid === productUuid,
  };
}
