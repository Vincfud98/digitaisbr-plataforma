import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Store } from '../../types';

interface LojasState {
  list: Store[];
  selected: Store | null;
}

const initialState: LojasState = {
  list: [],
  selected: null,
};

const lojasSlice = createSlice({
  name: 'lojas',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Store[]>) {
      state.list = action.payload;
    },
    setSelectedStore(state, action: PayloadAction<Store | null>) {
      state.selected = action.payload;
    },
    updateStore(state, action: PayloadAction<Store>) {
      const idx = state.list.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    toggleStoreActive(state, action: PayloadAction<string>) {
      const store = state.list.find((s) => s.id === action.payload);
      if (store) store.active = !store.active;
    },
    updateStoreProducts(state, action: PayloadAction<{ storeId: string; productIds: string[] }>) {
      const store = state.list.find((s) => s.id === action.payload.storeId);
      if (store) store.productIds = action.payload.productIds;
    },
  },
});

export const { setAll, setSelectedStore, updateStore, toggleStoreActive, updateStoreProducts } = lojasSlice.actions;
export default lojasSlice.reducer;
