import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Sale, SaleStatus } from '../../types';

interface VendasState {
  list: Sale[];
}

const initialState: VendasState = {
  list: [],
};

const vendasSlice = createSlice({
  name: 'vendas',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Sale[]>) {
      state.list = action.payload;
    },
    addSale(state, action: PayloadAction<Sale>) {
      state.list.unshift(action.payload);
    },
    updateSaleStatus(state, action: PayloadAction<{ id: string; status: SaleStatus }>) {
      const sale = state.list.find((s) => s.id === action.payload.id);
      if (sale) sale.status = action.payload.status;
    },
  },
});

export const { setAll, addSale, updateSaleStatus } = vendasSlice.actions;
export default vendasSlice.reducer;
