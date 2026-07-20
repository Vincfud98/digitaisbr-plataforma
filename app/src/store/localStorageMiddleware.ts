import type { Middleware } from '@reduxjs/toolkit';

const localStorageMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const result = next(action);

  const act = action as { type: string };
  if (!act.type || typeof act.type !== 'string') return result;

  const state = store.getState() as Record<string, unknown>;

  if (act.type.startsWith('auth/')) {
    const auth = state.auth as { user: unknown; isAuthenticated: boolean };
    if (auth.isAuthenticated && auth.user) {
      try { localStorage.setItem('digitaisbr_user', JSON.stringify(auth.user)); } catch {}
    } else {
      try { localStorage.removeItem('digitaisbr_user'); } catch {}
    }
  }

  if (act.type.startsWith('cart/')) {
    const cart = state.cart as { items: unknown[]; storeSlug: string | null };
    try { localStorage.setItem('digitaisbr_cart', JSON.stringify(cart)); } catch {}
  }

  return result;
};

export default localStorageMiddleware;
