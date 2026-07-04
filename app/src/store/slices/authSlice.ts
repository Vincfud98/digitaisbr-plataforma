import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'associado' | 'parceiro' | 'admin';
  plan?: 'basico' | 'intermediario' | 'avancado';
  avatar?: string;
  firebaseUid?: string;
}

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
      localStorage.setItem('digitaisbr_user', JSON.stringify(action.payload));
    },
    loginFailure(state) {
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('digitaisbr_user');
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('digitaisbr_user', JSON.stringify(state.user));
      }
    },
    setFirebaseReady(state, action: PayloadAction<boolean>) {
      state.firebaseReady = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile, setFirebaseReady } = authSlice.actions;
export default authSlice.reducer;
