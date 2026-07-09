import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productUuid: string;
  productName: string;
  productSlug: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  inStock: boolean;
  isBestDeal: boolean;
  addedAt: string; // ISO date
}

export interface WishlistState {
  items: WishlistItem[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: WishlistState = {
  items: [],
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
    },

    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
