import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Plan } from '../../types';

interface PlanosState {
  list: Plan[];
  editing: Plan | null;
}

const initialState: PlanosState = {
  list: [],
  editing: null,
};

const planosSlice = createSlice({
  name: 'planos',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Plan[]>) {
      state.list = action.payload;
    },
    setEditing(state, action: PayloadAction<Plan | null>) {
      state.editing = action.payload;
    },
    updatePlan(state, action: PayloadAction<Plan>) {
      const index = state.list.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      state.editing = null;
    },
  },
});

export const { setAll, setEditing, updatePlan } = planosSlice.actions;
export default planosSlice.reducer;
