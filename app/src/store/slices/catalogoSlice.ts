import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface CatalogoState {
  list: Product[];
  selected: Product | null;
}

const initialState: CatalogoState = {
  list: [],
  selected: null,
};

const catalogoSlice = createSlice({
  name: 'catalogo',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Product[]>) {
      state.list = action.payload;
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selected = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.list.push(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setAll, setSelectedProduct, addProduct, updateProduct, removeProduct } = catalogoSlice.actions;
export default catalogoSlice.reducer;
