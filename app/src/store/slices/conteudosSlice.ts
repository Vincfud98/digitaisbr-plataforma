import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Content } from '../../types';

interface ConteudosState {
  list: Content[];
}

const initialState: ConteudosState = { list: [] };

const conteudosSlice = createSlice({
  name: 'conteudos',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Content[]>) {
      state.list = action.payload;
    },
    addContent(state, action: PayloadAction<Content>) { state.list.push(action.payload); },
    updateContent(state, action: PayloadAction<Content>) {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeContent(state, action: PayloadAction<string>) {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
  },
});

export const { setAll, addContent, updateContent, removeContent } = conteudosSlice.actions;
export default conteudosSlice.reducer;
