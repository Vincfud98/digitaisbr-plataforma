import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

function getExtension(file: File): string {
  return file.name.split('.').pop() || 'jpg';
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  return uploadImage(file, `products/${productId}/${file.name}`);
}

export async function uploadStoreLogo(file: File, storeId: string): Promise<string> {
  const ext = getExtension(file);
  return uploadImage(file, `stores/${storeId}/logo-${Date.now()}.${ext}`);
}

export async function uploadStoreBanner(file: File, storeId: string): Promise<string> {
  const ext = getExtension(file);
  return uploadImage(file, `stores/${storeId}/banner-${Date.now()}.${ext}`);
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = getExtension(file);
  return uploadImage(file, `avatars/${userId}.${ext}`);
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const fileRef = ref(storage, fileUrl);
  await deleteObject(fileRef);
}
