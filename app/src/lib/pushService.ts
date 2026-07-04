import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';
import { updateDocument } from './firestoreService';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let messaging: ReturnType<typeof getMessaging> | null = null;

function getMessagingInstance() {
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch {
      return null;
    }
  }
  return messaging;
}

export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const msg = getMessagingInstance();
    if (!msg) return null;

    const token = await getToken(msg, { vapidKey: VAPID_KEY || undefined });
    if (token && userId) {
      await updateDocument('users', userId, { fcmToken: token });
    }
    return token;
  } catch (err) {
    console.error('Push permission error:', err);
    return null;
  }
}

export function onPushMessage(callback: (payload: { title: string; body: string; data?: Record<string, string> }) => void) {
  const msg = getMessagingInstance();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title || 'Nova notificação',
      body: payload.notification?.body || '',
      data: payload.data as Record<string, string> | undefined,
    });
  });
}

export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}
