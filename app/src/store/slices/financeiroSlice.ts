import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FinancialTransaction } from '../../types';

interface FinanceiroState {
  list: FinancialTransaction[];
}

const initialState: FinanceiroState = {
  list: [],
};

const financeiroSlice = createSlice({
  name: 'financeiro',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<FinancialTransaction[]>) {
      state.list = action.payload;
    },
    addTransaction(state, action: PayloadAction<FinancialTransaction>) {
      state.list.unshift(action.payload);
    },
  },
});

export const { setAll, addTransaction } = financeiroSlice.actions;
export default financeiroSlice.reducer;
