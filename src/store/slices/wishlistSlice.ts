import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  image: string;
  price: number;
  originalPrice: number;
  discount?: number;
  badge?: string;
  inStock: boolean;
  isBestDeal?: boolean;
  addedAt: string; // ISO date
  /**
   * The wishlist ENTRY's own id (from POST /wishlist-add's response), needed
   * to call DELETE /wishlist-remove. GET /wishlist-get does not return this
   * per item, so it's only known for products added THIS browser has added —
   * see wishListUuidByProduct below for how that's preserved across a
   * server re-sync.
   */
  wishListUuid?: string;
}

export interface WishlistState {
  items: WishlistItem[];
  /**
   * productUuid → wishListUuid, persisted independently of `items`.
   *
   * `items` gets wholesale-replaced every time the server wishlist is
   * re-fetched (setWishlist), and that server response never includes
   * wishListUuid — so without a separate durable record, the id captured at
   * add-time would be lost the moment the list next re-syncs, and "remove"
   * would silently stop working for that item. This map is that durable
   * record; useWishlist re-attaches it onto each item after every sync.
   */
  wishListUuidByProduct: Record<string, string>;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: WishlistState = {
  items: [],
  wishListUuidByProduct: {},
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Add item — if already exists, remove it (toggle)
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.findIndex(
        (i) => i.productUuid === action.payload.productUuid
      );
      if (exists !== -1) {
        state.items.splice(exists, 1); // remove
      } else {
        state.items.unshift({ ...action.payload, addedAt: new Date().toISOString() }); // add to top
      }
    },

    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productUuid !== action.payload);
      delete state.wishListUuidByProduct[action.payload];
    },

    clearWishlist(state) {
      state.items = [];
      state.wishListUuidByProduct = {};
    },

    /**
     * Wholesale-replaces the list with the server's own answer (GET
     * /wishlist-get, mapped to this shape). This is what makes the backend
     * the actual source of truth for "add": useWishlist's add mutation calls
     * the API, then re-fetches and dispatches this rather than optimistically
     * pushing a locally-built item, so what's on screen always matches what
     * the account actually has saved server-side.
     */
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },

    /** Records a wishlist entry's id the moment POST /wishlist-add returns it. */
    recordWishListUuid(
      state,
      action: PayloadAction<{ productUuid: string; wishListUuid: string }>,
    ) {
      state.wishListUuidByProduct[action.payload.productUuid] = action.payload.wishListUuid;
    },
  },
});

export const {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlist,
  recordWishListUuid,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
