import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { loginSuccess, logout, setFirebaseReady } from './store/slices/authSlice';
import { onAuthChange, getUserProfile } from './lib/authService';
import App from './App';
import './index.css';

onAuthChange(async (firebaseUser) => {
  if (firebaseUser) {
    const profile = await getUserProfile(firebaseUser);
    store.dispatch(loginSuccess({
      id: profile.uid,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      plan: profile.plan,
      avatar: profile.avatar,
      firebaseUid: profile.uid,
    }));
  } else {
    store.dispatch(logout());
  }
  store.dispatch(setFirebaseReady(true));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {});
}
