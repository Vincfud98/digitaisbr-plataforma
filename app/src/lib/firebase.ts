import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDgbTuXzez0jpdbYv0sTY1oGwR2MaQ3ZPE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'digitaisbr-plataforma.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'digitaisbr-plataforma',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'digitaisbr-plataforma.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '401371609866',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:401371609866:web:ccd98275d34b41ed4698f3',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

let _dbPromise: Promise<Firestore> | null = null;
export function getDb(): Promise<Firestore> {
  if (!_dbPromise) {
    _dbPromise = import('firebase/firestore').then(({ getFirestore, connectFirestoreEmulator }) => {
      const db = getFirestore(app);
      if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
        try { connectFirestoreEmulator(db, 'localhost', 8080); } catch { /* already connected */ }
      }
      return db;
    });
  }
  return _dbPromise;
}

let _storagePromise: Promise<FirebaseStorage> | null = null;
export function getStorageInstance(): Promise<FirebaseStorage> {
  if (!_storagePromise) {
    _storagePromise = import('firebase/storage').then(({ getStorage, connectStorageEmulator }) => {
      const storage = getStorage(app);
      if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
        try { connectStorageEmulator(storage, 'localhost', 9199); } catch { /* already connected */ }
      }
      return storage;
    });
  }
  return _storagePromise;
}

export default app;
