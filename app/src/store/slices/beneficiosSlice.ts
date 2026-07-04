import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Benefit } from '../../types';

interface BeneficiosState {
  list: Benefit[];
}

const initialState: BeneficiosState = { list: [] };

const beneficiosSlice = createSlice({
  name: 'beneficios',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Benefit[]>) {
      state.list = action.payload;
    },
    addBenefit(state, action: PayloadAction<Benefit>) { state.list.push(action.payload); },
    updateBenefit(state, action: PayloadAction<Benefit>) {
      const idx = state.list.findIndex((b) => b.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeBenefit(state, action: PayloadAction<string>) {
      state.list = state.list.filter((b) => b.id !== action.payload);
    },
  },
});

export const { setAll, addBenefit, updateBenefit, removeBenefit } = beneficiosSlice.actions;
export default beneficiosSlice.reducer;
