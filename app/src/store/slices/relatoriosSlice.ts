import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ReportConfig } from '../../types';

interface RelatoriosState {
  list: ReportConfig[];
}

const initialState: RelatoriosState = { list: [] };

const relatoriosSlice = createSlice({
  name: 'relatorios',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<ReportConfig[]>) {
      state.list = action.payload;
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const report = state.list.find((r) => r.id === action.payload);
      if (report) report.favorite = !report.favorite;
    },
    markGenerated: {
      reducer(state, action: PayloadAction<{ id: string; timestamp: string }>) {
        const report = state.list.find((r) => r.id === action.payload.id);
        if (report) report.lastGenerated = action.payload.timestamp;
      },
      prepare(id: string) {
        return { payload: { id, timestamp: new Date().toISOString() } };
      },
    },
  },
});

export const { setAll, toggleFavorite, markGenerated } = relatoriosSlice.actions;
export default relatoriosSlice.reducer;
