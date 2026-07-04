import {
  collection, doc, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  writeBatch, onSnapshot,
} from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';

export async function getCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
}

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as T;
}

export async function createDocument(collectionName: string, data: DocumentData, docId?: string): Promise<string> {
  if (docId) {
    await setDoc(doc(db, collectionName, docId), data);
    return docId;
  }
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>): Promise<void> {
  await updateDoc(doc(db, collectionName, docId), data);
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}

export async function batchWrite(operations: Array<{
  type: 'set' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: DocumentData;
}>): Promise<void> {
  const batch = writeBatch(db);
  for (const op of operations) {
    const ref = doc(db, op.collection, op.docId);
    if (op.type === 'set' && op.data) batch.set(ref, op.data);
    else if (op.type === 'update' && op.data) batch.update(ref, op.data);
    else if (op.type === 'delete') batch.delete(ref);
  }
  await batch.commit();
}

export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
) {
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as T));
    callback(data);
  });
}

export { where, orderBy, limit, query, collection, doc };
