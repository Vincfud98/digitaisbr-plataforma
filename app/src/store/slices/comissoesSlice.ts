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
    updateCommissionStatus: {
      reducer(state, action: PayloadAction<{ id: string; status: CommissionStatus; paidAt?: string }>) {
        const comm = state.list.find((c) => c.id === action.payload.id);
        if (comm) {
          comm.status = action.payload.status;
          if (action.payload.paidAt) {
            comm.paidAt = action.payload.paidAt;
          }
        }
      },
      prepare(payload: { id: string; status: CommissionStatus }) {
        return {
          payload: {
            ...payload,
            paidAt: payload.status === 'paga' ? new Date().toISOString().split('T')[0] : undefined,
          },
        };
      },
    },
  },
});

export const { setAll, updateCommissionStatus } = comissoesSlice.actions;
export default comissoesSlice.reducer;
