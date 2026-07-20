import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, getDb } from './firebase';

async function fsDoc(collection: string, docId: string) {
  const [db, { doc }] = await Promise.all([getDb(), import('firebase/firestore')]);
  return doc(db, collection, docId);
}

async function fsSetDoc(collection: string, docId: string, data: any) {
  const [ref, { setDoc }] = await Promise.all([fsDoc(collection, docId), import('firebase/firestore')]);
  await setDoc(ref, data);
}

async function fsGetDoc(collection: string, docId: string) {
  const [ref, { getDoc }] = await Promise.all([fsDoc(collection, docId), import('firebase/firestore')]);
  return getDoc(ref);
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'associado' | 'parceiro' | 'admin';
  plan?: 'basico' | 'intermediario' | 'avancado';
  avatar?: string;
  phone?: string;
  cpfCnpj?: string;
  createdAt: string;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  plan: 'basico' | 'intermediario' | 'avancado',
  extra?: { phone?: string; cpfCnpj?: string }
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const profile: UserProfile = {
    uid: cred.user.uid,
    name,
    email,
    role: 'associado',
    plan,
    phone: extra?.phone || '',
    cpfCnpj: extra?.cpfCnpj || '',
    createdAt: new Date().toISOString(),
  };

  await fsSetDoc('users', cred.user.uid, profile);
  return profile;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(cred.user);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const existing = await fsGetDoc('users', cred.user.uid);
  if (existing.exists()) {
    return existing.data() as UserProfile;
  }
  const profile: UserProfile = {
    uid: cred.user.uid,
    name: cred.user.displayName || 'Usuário',
    email: cred.user.email || '',
    role: 'associado',
    plan: 'basico',
    createdAt: new Date().toISOString(),
  };
  await fsSetDoc('users', cred.user.uid, profile);
  return profile;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const snap = await fsGetDoc('users', firebaseUser.uid);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || 'Usuário',
    email: firebaseUser.email || '',
    role: 'associado',
    plan: 'basico',
    createdAt: new Date().toISOString(),
  };
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
