import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HighlightItem } from '../../types';

interface DestaquesState {
  list: HighlightItem[];
}

const initialState: DestaquesState = { list: [] };

const destaquesSlice = createSlice({
  name: 'destaques',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<HighlightItem[]>) {
      state.list = action.payload;
    },
    addHighlight(state, action: PayloadAction<HighlightItem>) {
      state.list.push(action.payload);
    },
    toggleHighlightActive(state, action: PayloadAction<string>) {
      const item = state.list.find((h) => h.id === action.payload);
      if (item) item.active = !item.active;
    },
    removeHighlight(state, action: PayloadAction<string>) {
      state.list = state.list.filter((h) => h.id !== action.payload);
    },
    updatePosition(state, action: PayloadAction<{ id: string; position: number }>) {
      const item = state.list.find((h) => h.id === action.payload.id);
      if (item) item.position = action.payload.position;
    },
  },
});

export const { setAll, addHighlight, toggleHighlightActive, removeHighlight, updatePosition } = destaquesSlice.actions;
export default destaquesSlice.reducer;
