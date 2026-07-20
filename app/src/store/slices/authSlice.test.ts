import { describe, it, expect } from 'vitest';
import authReducer, { loginStart, loginSuccess, loginFailure, logout, updateProfile } from './authSlice';
import type { User } from '../../types';

const mockUser: User = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'associado',
  plan: 'basico',
};

describe('authSlice', () => {
  const initial = authReducer(undefined, { type: '@@INIT' });

  it('starts unauthenticated', () => {
    expect(initial.isAuthenticated).toBe(false);
    expect(initial.user).toBeNull();
  });

  it('loginStart sets loading', () => {
    const state = authReducer(initial, loginStart());
    expect(state.loading).toBe(true);
  });

  it('loginSuccess sets user and authenticated', () => {
    const state = authReducer(initial, loginSuccess(mockUser));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@example.com');
    expect(state.loading).toBe(false);
  });

  it('loginFailure clears loading', () => {
    const loading = authReducer(initial, loginStart());
    const state = authReducer(loading, loginFailure());
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout clears user', () => {
    const loggedIn = authReducer(initial, loginSuccess(mockUser));
    const state = authReducer(loggedIn, logout());
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('updateProfile merges partial data', () => {
    const loggedIn = authReducer(initial, loginSuccess(mockUser));
    const state = authReducer(loggedIn, updateProfile({ name: 'Updated' }));
    expect(state.user?.name).toBe('Updated');
    expect(state.user?.email).toBe('test@example.com');
  });
});
