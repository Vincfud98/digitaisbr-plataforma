import { createDocument } from './firestoreService';
import type { Notification, NotificationType } from '../types';

export async function createNotification(params: {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  actionUrl?: string;
}): Promise<Notification> {
  const notification: Omit<Notification, 'id'> = {
    type: params.type,
    title: params.title,
    message: params.message,
    channel: 'in-app',
    userId: params.userId,
    read: false,
    actionUrl: params.actionUrl || null,
    createdAt: new Date().toISOString(),
  };
  const id = await createDocument('notifications', notification);
  return { ...notification, id };
}

export async function notifySale(associadoId: string, customerName: string, total: number) {
  return createNotification({
    type: 'venda',
    title: 'Nova venda!',
    message: `${customerName} comprou R$ ${total.toFixed(2)} na sua loja`,
    userId: associadoId,
    actionUrl: '/portal/vendas',
  });
}

export async function notifyCommission(associadoId: string, value: number) {
  return createNotification({
    type: 'comissao',
    title: 'Comissão aprovada',
    message: `Comissão de R$ ${value.toFixed(2)} foi aprovada`,
    userId: associadoId,
    actionUrl: '/portal/financeiro',
  });
}

export async function notifySystem(userId: string, title: string, message: string) {
  return createNotification({ type: 'sistema', title, message, userId });
}
