import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productUuid?: string;
  variantUuid?: string;
  accessoriesUuid?: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  inStock: boolean;
  slug?: string;
  minBookingPrice?: number;   // minimum booking deposit for this product
}

export interface CartState {
  items: CartItem[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to cart.
    // If item already exists → REPLACE quantity with the new selected qty (do NOT accumulate).
    // This prevents stacking when user clicks "Add to Cart" multiple times on the same product.
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        // Replace quantity — user explicitly chose this qty on the product page
        existing.quantity = action.payload.quantity;
        // Also refresh price/image/variantUuid/productUuid/accessoriesUuid in case they changed
        existing.price = action.payload.price;
        existing.originalPrice = action.payload.originalPrice;
        existing.image = action.payload.image || existing.image;
        existing.variantUuid = action.payload.variantUuid || existing.variantUuid;
        existing.productUuid = action.payload.productUuid || existing.productUuid;
        existing.accessoriesUuid = action.payload.accessoriesUuid !== undefined ? action.payload.accessoriesUuid : existing.accessoriesUuid;
      } else {
        state.items.push({ ...action.payload });
      }
    },

    // Increase quantity by 1 (from cart page + button)
    increaseQty(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },

    // Decrease quantity by 1 (minimum 1)
    decreaseQty(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },

    // Remove item from cart
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // Clear entire cart
    clearCart(state) {
      state.items = [];
    },

    // Patch minBookingPrice on an existing cart item (fetched lazily in checkout)
    patchMinBookingPrice(state, action: PayloadAction<{ id: string; minBookingPrice: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.minBookingPrice = action.payload.minBookingPrice;
    },
  },
});

export const {
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
  patchMinBookingPrice,
} = cartSlice.actions;

export default cartSlice.reducer;
