import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Commission, CommissionStatus } from '../../types';

interface ComissoesState {
  list: Commission[];
}

const initialState: ComissoesState = {
  list: [],
};

const comissoesSlice = createSlice({
  name: 'comissoes',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Commission[]>) {
      state.list = action.payload;
    },
    updateCommissionStatus(state, action: PayloadAction<{ id: string; status: CommissionStatus }>) {
      const comm = state.list.find((c) => c.id === action.payload.id);
      if (comm) {
        comm.status = action.payload.status;
        if (action.payload.status === 'paga') {
          comm.paidAt = new Date().toISOString().split('T')[0];
        }
      }
    },
  },
});

export const { setAll, updateCommissionStatus } = comissoesSlice.actions;
export default comissoesSlice.reducer;
