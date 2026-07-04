import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ServiceRequest, ServiceRequestStatus } from '../../types';

interface ServicosState {
  list: ServiceRequest[];
}

const initialState: ServicosState = { list: [] };

const servicosSlice = createSlice({
  name: 'servicos',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<ServiceRequest[]>) {
      state.list = action.payload;
    },
    addServiceRequest(state, action: PayloadAction<ServiceRequest>) {
      state.list.unshift(action.payload);
    },
    updateServiceStatus(state, action: PayloadAction<{ id: string; status: ServiceRequestStatus }>) {
      const req = state.list.find((s) => s.id === action.payload.id);
      if (req) req.status = action.payload.status;
    },
    rateService(state, action: PayloadAction<{ id: string; rating: number }>) {
      const req = state.list.find((s) => s.id === action.payload.id);
      if (req) req.rating = action.payload.rating;
    },
  },
});

export const { setAll, addServiceRequest, updateServiceStatus, rateService } = servicosSlice.actions;
export default servicosSlice.reducer;
