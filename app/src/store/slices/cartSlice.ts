import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  storeSlug: string | null;
}

const initialState: CartState = {
  items: [],
  storeSlug: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ item: CartItem; storeSlug: string }>) {
      if (state.storeSlug && state.storeSlug !== action.payload.storeSlug) {
        state.items = [];
      }
      state.storeSlug = action.payload.storeSlug;
      const existing = state.items.find((i) => i.productId === action.payload.item.productId);
      if (existing) {
        existing.quantity += action.payload.item.quantity;
      } else {
        state.items.push(action.payload.item);
      }
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      if (state.items.length === 0) state.storeSlug = null;
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (state.items.length === 0) state.storeSlug = null;
    },
    clearCart(state) {
      state.items = [];
      state.storeSlug = null;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
