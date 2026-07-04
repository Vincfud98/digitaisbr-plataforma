import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SupportTicket, TicketStatus, TicketMessage } from '../../types';

interface SuporteState {
  list: SupportTicket[];
  messages: TicketMessage[];
}

const initialState: SuporteState = { list: [], messages: [] };

const suporteSlice = createSlice({
  name: 'suporte',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<SupportTicket[]>) {
      state.list = action.payload;
    },
    setMessages(state, action: PayloadAction<TicketMessage[]>) {
      state.messages = action.payload;
    },
    addTicket(state, action: PayloadAction<SupportTicket>) {
      state.list.unshift(action.payload);
    },
    updateTicketStatus(state, action: PayloadAction<{ id: string; status: TicketStatus }>) {
      const ticket = state.list.find((t) => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
        ticket.updatedAt = new Date().toISOString();
        if (action.payload.status === 'resolvido') {
          ticket.resolvedAt = new Date().toISOString();
        }
      }
    },
    assignTicket(state, action: PayloadAction<{ id: string; assignedTo: string }>) {
      const ticket = state.list.find((t) => t.id === action.payload.id);
      if (ticket) ticket.assignedTo = action.payload.assignedTo;
    },
    addMessage(state, action: PayloadAction<TicketMessage>) {
      state.messages.push(action.payload);
      const ticket = state.list.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.messages += 1;
        ticket.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { setAll, setMessages, addTicket, updateTicketStatus, assignTicket, addMessage } = suporteSlice.actions;
export default suporteSlice.reducer;
