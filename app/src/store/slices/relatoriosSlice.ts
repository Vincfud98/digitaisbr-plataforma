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
    markGenerated(state, action: PayloadAction<string>) {
      const report = state.list.find((r) => r.id === action.payload);
      if (report) report.lastGenerated = new Date().toISOString();
    },
  },
});

export const { setAll, toggleFavorite, markGenerated } = relatoriosSlice.actions;
export default relatoriosSlice.reducer;
