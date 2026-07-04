import { createDocument, updateDocument, deleteDocument } from './firestoreService';
import { createCommissionForSale } from './commissionService';
import { notifySale } from './notificationService';
import type {
  Associado, Product, Store, Sale, Benefit, Partner, Content,
  ForumTopic, ServiceRequest, HighlightItem, SupportTicket, TicketMessage,
  Commission, FinancialTransaction, CartItem, OrderCustomer, PaymentMethod,
} from '../types';

const COLLECTIONS = {
  associados: 'associados',
  products: 'products',
  stores: 'stores',
  sales: 'sales',
  commissions: 'commissions',
  financial: 'financial',
  benefits: 'benefits',
  partners: 'partners',
  contents: 'contents',
  forumTopics: 'forumTopics',
  notifications: 'notifications',
  services: 'services',
  highlights: 'highlights',
  tickets: 'tickets',
  ticketMessages: 'ticketMessages',
} as const;

// --- Associados ---
export async function saveAssociado(data: Omit<Associado, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) {
    await updateDocument(COLLECTIONS.associados, id, rest);
    return id;
  }
  return createDocument(COLLECTIONS.associados, rest);
}

export async function removeAssociado(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.associados, id);
}

export async function updateAssociadoStatus(id: string, status: string): Promise<void> {
  await updateDocument(COLLECTIONS.associados, id, { status, updatedAt: new Date().toISOString() });
}

// --- Products ---
export async function saveProduct(data: Omit<Product, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) {
    await updateDocument(COLLECTIONS.products, id, { ...rest, updatedAt: new Date().toISOString() });
    return id;
  }
  return createDocument(COLLECTIONS.products, { ...rest, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
}

export async function removeProduct(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.products, id);
}

// --- Stores ---
export async function saveStore(data: Omit<Store, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) {
    await updateDocument(COLLECTIONS.stores, id, rest);
    return id;
  }
  return createDocument(COLLECTIONS.stores, rest);
}

// --- Sales & Orders ---
export async function createOrder(params: {
  items: CartItem[];
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  storeSlug: string;
  storeName: string;
  associadoId: string;
  products: Product[];
}): Promise<{ orderId: string; sales: Sale[]; commissions: Commission[] }> {
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
  const sales: Sale[] = [];
  const commissions: Commission[] = [];

  for (const item of params.items) {
    const sale: Omit<Sale, 'id'> = {
      productId: item.productId,
      associadoId: params.associadoId,
      storeSlug: params.storeSlug,
      customerName: params.customer.name,
      customerEmail: params.customer.email,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      status: 'pendente',
      checkoutRef: orderId,
      createdAt: new Date().toISOString(),
    };
    const saleId = await createDocument(COLLECTIONS.sales, sale);
    const fullSale = { ...sale, id: saleId };
    sales.push(fullSale);

    const product = params.products.find((p) => p.id === item.productId);
    if (product) {
      const commission = await createCommissionForSale(fullSale, product);
      commissions.push(commission);
    }
  }

  const total = sales.reduce((acc, s) => acc + s.totalPrice, 0);

  await createDocument('orders', {
    id: orderId,
    storeSlug: params.storeSlug,
    storeName: params.storeName,
    associadoId: params.associadoId,
    customer: params.customer,
    items: params.items,
    subtotal: total,
    total: params.paymentMethod === 'pix' ? total * 0.95 : total,
    paymentMethod: params.paymentMethod,
    status: 'aguardando_pagamento',
    createdAt: new Date().toISOString(),
  }, orderId);

  notifySale(params.associadoId, params.customer.name, total).catch(() => {});

  return { orderId, sales, commissions };
}

export async function updateSaleStatus(id: string, status: string): Promise<void> {
  await updateDocument(COLLECTIONS.sales, id, { status });
}

// --- Commissions ---
export async function updateCommissionStatus(id: string, status: string): Promise<void> {
  const data: Record<string, unknown> = { status };
  if (status === 'paga') data.paidAt = new Date().toISOString();
  await updateDocument(COLLECTIONS.commissions, id, data);
}

// --- Financial ---
export async function saveTransaction(data: Omit<FinancialTransaction, 'id'>): Promise<string> {
  return createDocument(COLLECTIONS.financial, data);
}

// --- Benefits ---
export async function saveBenefit(data: Omit<Benefit, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.benefits, id, rest); return id; }
  return createDocument(COLLECTIONS.benefits, rest);
}

export async function removeBenefit(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.benefits, id);
}

// --- Partners ---
export async function savePartner(data: Omit<Partner, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.partners, id, rest); return id; }
  return createDocument(COLLECTIONS.partners, rest);
}

export async function removePartner(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.partners, id);
}

// --- Contents ---
export async function saveContent(data: Omit<Content, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.contents, id, rest); return id; }
  return createDocument(COLLECTIONS.contents, rest);
}

export async function removeContent(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.contents, id);
}

// --- Forum ---
export async function saveTopic(data: Omit<ForumTopic, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.forumTopics, id, rest); return id; }
  return createDocument(COLLECTIONS.forumTopics, rest);
}

// --- Services ---
export async function saveServiceRequest(data: Omit<ServiceRequest, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.services, id, rest); return id; }
  return createDocument(COLLECTIONS.services, rest);
}

// --- Highlights ---
export async function saveHighlight(data: Omit<HighlightItem, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.highlights, id, rest); return id; }
  return createDocument(COLLECTIONS.highlights, rest);
}

export async function removeHighlight(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.highlights, id);
}

// --- Support ---
export async function saveTicket(data: Omit<SupportTicket, 'id'> & { id?: string }): Promise<string> {
  const { id, ...rest } = data;
  if (id) { await updateDocument(COLLECTIONS.tickets, id, rest); return id; }
  return createDocument(COLLECTIONS.tickets, rest);
}

export async function saveTicketMessage(data: Omit<TicketMessage, 'id'>): Promise<string> {
  const id = await createDocument(COLLECTIONS.ticketMessages, data);
  await updateDocument(COLLECTIONS.tickets, data.ticketId, {
    messages: Date.now(),
    updatedAt: new Date().toISOString(),
  });
  return id;
}
