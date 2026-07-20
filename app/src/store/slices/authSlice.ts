import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

export type { User };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  firebaseReady: boolean;
}

const saved = localStorage.getItem('digitaisbr_user');

const initialState: AuthState = {
  user: saved ? JSON.parse(saved) : null,
  isAuthenticated: !!saved,
  loading: false,
  firebaseReady: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure(state) {
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setFirebaseReady(state, action: PayloadAction<boolean>) {
      state.firebaseReady = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile, setFirebaseReady } = authSlice.actions;
export default authSlice.reducer;
