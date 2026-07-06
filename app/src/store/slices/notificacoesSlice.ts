import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types';

interface NotificacoesState {
  list: Notification[];
}

const initialState: NotificacoesState = { list: [] };

const notificacoesSlice = createSlice({
  name: 'notificacoes',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Notification[]>) {
      state.list = action.payload;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notif = state.list.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllAsRead(state) {
      state.list.forEach((n) => { n.read = true; });
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.list.unshift(action.payload);
    },
  },
});

export const { setAll, markAsRead, markAllAsRead, removeNotification, addNotification } = notificacoesSlice.actions;
export default notificacoesSlice.reducer;
