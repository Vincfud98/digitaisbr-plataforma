import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ForumTopic } from '../../types';

interface ComunidadeState {
  list: ForumTopic[];
}

const initialState: ComunidadeState = { list: [] };

const comunidadeSlice = createSlice({
  name: 'comunidade',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<ForumTopic[]>) {
      state.list = action.payload;
    },
    addTopic(state, action: PayloadAction<ForumTopic>) {
      state.list.unshift(action.payload);
    },
    removeTopic(state, action: PayloadAction<string>) {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
    updateTopicStatus(state, action: PayloadAction<{ id: string; status: ForumTopic['status'] }>) {
      const topic = state.list.find((t) => t.id === action.payload.id);
      if (topic) topic.status = action.payload.status;
    },
  },
});

export const { setAll, addTopic, removeTopic, updateTopicStatus } = comunidadeSlice.actions;
export default comunidadeSlice.reducer;
