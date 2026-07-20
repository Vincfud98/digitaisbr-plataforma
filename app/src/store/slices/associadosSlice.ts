import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Associado } from '../../types';

interface AssociadosState {
  list: Associado[];
  selected: Associado | null;
}

const initialState: AssociadosState = {
  list: [],
  selected: null,
};

const associadosSlice = createSlice({
  name: 'associados',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Associado[]>) {
      state.list = action.payload;
    },
    setSelected(state, action: PayloadAction<Associado | null>) {
      state.selected = action.payload;
    },
    addAssociado(state, action: PayloadAction<Associado>) {
      state.list.unshift(action.payload);
    },
    updateAssociado(state, action: PayloadAction<Associado>) {
      const index = state.list.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      if (state.selected?.id === action.payload.id) state.selected = action.payload;
    },
    removeAssociado(state, action: PayloadAction<string>) {
      state.list = state.list.filter((a) => a.id !== action.payload);
      if (state.selected?.id === action.payload) state.selected = null;
    },
    changeStatus(state, action: PayloadAction<{ id: string; status: Associado['status'] }>) {
      const assoc = state.list.find((a) => a.id === action.payload.id);
      if (assoc) assoc.status = action.payload.status;
    },
  },
});

export const { setAll, setSelected, addAssociado, updateAssociado, removeAssociado, changeStatus } = associadosSlice.actions;
export default associadosSlice.reducer;
