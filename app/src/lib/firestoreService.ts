import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { getDb } from './firebase';

let _kit: Promise<any> | null = null;

function getKit() {
  if (!_kit) {
    _kit = Promise.all([getDb(), import('firebase/firestore')]).then(([db, mod]) => ({ db, ...mod }));
  }
  return _kit;
}

export async function getCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const { db, collection, getDocs, query } = await getKit();
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ ...d.data(), id: d.id } as T));
}

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const { db, doc, getDoc } = await getKit();
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as T;
}

export async function createDocument(collectionName: string, data: DocumentData, docId?: string): Promise<string> {
  const { db, doc, setDoc, addDoc, collection } = await getKit();
  if (docId) {
    await setDoc(doc(db, collectionName, docId), data);
    return docId;
  }
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>): Promise<void> {
  const { db, doc, updateDoc } = await getKit();
  await updateDoc(doc(db, collectionName, docId), data);
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const { db, doc, deleteDoc } = await getKit();
  await deleteDoc(doc(db, collectionName, docId));
}

export async function batchWrite(operations: Array<{
  type: 'set' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: DocumentData;
}>): Promise<void> {
  const { db, doc, writeBatch } = await getKit();
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
  let unsub: (() => void) | null = null;
  getKit().then(({ db, collection, query, onSnapshot }) => {
    const q = constraints.length > 0
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);
    unsub = onSnapshot(q, (snap: any) => {
      const data = snap.docs.map((d: any) => ({ ...d.data(), id: d.id } as T));
      callback(data);
    });
  });
  return () => { if (unsub) unsub(); };
}

export async function getWhere<T>(collectionName: string, field: string, op: any, value: any): Promise<T[]> {
  const { db, collection, getDocs, query, where } = await getKit();
  const q = query(collection(db, collectionName), where(field, op, value));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ ...d.data(), id: d.id } as T));
}
