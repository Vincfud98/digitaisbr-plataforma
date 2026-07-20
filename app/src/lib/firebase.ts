import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDgbTuXzez0jpdbYv0sTY1oGwR2MaQ3ZPE',
  authDomain: 'digitaisbr-plataforma.firebaseapp.com',
  projectId: 'digitaisbr-plataforma',
  storageBucket: 'digitaisbr-plataforma.firebasestorage.app',
  messagingSenderId: '401371609866',
  appId: '1:401371609866:web:ccd98275d34b41ed4698f3',
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
