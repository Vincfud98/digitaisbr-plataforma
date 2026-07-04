import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Partner } from '../../types';

interface ParceirosState {
  list: Partner[];
}

const initialState: ParceirosState = { list: [] };

const parceirosSlice = createSlice({
  name: 'parceiros',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Partner[]>) {
      state.list = action.payload;
    },
    addPartner(state, action: PayloadAction<Partner>) { state.list.push(action.payload); },
    updatePartner(state, action: PayloadAction<Partner>) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removePartner(state, action: PayloadAction<string>) {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setAll, addPartner, updatePartner, removePartner } = parceirosSlice.actions;
export default parceirosSlice.reducer;
