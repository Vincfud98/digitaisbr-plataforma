import type { Middleware } from '@reduxjs/toolkit';

const COLLECTION_MAP: Record<string, string> = {
  'associados': 'associados',
  'catalogo': 'products',
  'lojas': 'stores',
  'vendas': 'sales',
  'comissoes': 'commissions',
  'financeiro': 'financial',
  'beneficios': 'benefits',
  'parceiros': 'partners',
  'conteudos': 'contents',
  'comunidade': 'forumTopics',
  'notificacoes': 'notifications',
  'servicos': 'services',
  'suporte': 'tickets',
  'planos': 'plans',
  'relatorios': 'reports',
};

async function syncToFirestore(collectionName: string, actionName: string, payload: any, getState: () => any) {
  const { createDocument, updateDocument, deleteDocument } = await import('../lib/firestoreService');

  switch (actionName) {
    case 'addAssociado':
    case 'addProduct':
    case 'addSale':
    case 'addTransaction':
    case 'addBenefit':
    case 'addPartner':
    case 'addContent':
    case 'addTopic':
    case 'addTicket':
    case 'addServiceRequest':
    case 'addPlan':
    case 'addNotification': {
      const { id, ...data } = payload as { id: string; [key: string]: unknown };
      if (id) createDocument(collectionName, data, id).catch(console.error);
      break;
    }

    case 'updateAssociado':
    case 'updateProduct':
    case 'updateStore':
    case 'updatePlan':
    case 'updateBenefit':
    case 'updatePartner':
    case 'updateContent': {
      const { id, ...data } = payload as { id: string; [key: string]: unknown };
      if (id) updateDocument(collectionName, id, data).catch(console.error);
      break;
    }

    case 'removeAssociado':
    case 'removeProduct':
    case 'removeBenefit':
    case 'removePartner':
    case 'removeContent':
    case 'removeTopic':
    case 'removeNotification': {
      const id = typeof payload === 'string' ? payload : (payload as { id: string }).id;
      if (id) deleteDocument(collectionName, id).catch(console.error);
      break;
    }

    case 'updateSaleStatus': {
      const { id, status } = payload as { id: string; status: string };
      if (id) updateDocument(collectionName, id, { status }).catch(console.error);
      break;
    }

    case 'updateCommissionStatus': {
      const { id, status } = payload as { id: string; status: string };
      const data: Record<string, unknown> = { status };
      if (status === 'paga') data.paidAt = new Date().toISOString();
      if (id) updateDocument(collectionName, id, data).catch(console.error);
      break;
    }

    case 'changeStatus': {
      const { id, status } = payload as { id: string; status: string };
      if (id) updateDocument(collectionName, id, { status, updatedAt: new Date().toISOString() }).catch(console.error);
      break;
    }

    case 'toggleStoreActive': {
      const id = typeof payload === 'string' ? payload : (payload as { id: string }).id;
      if (id) {
        const state = getState() as { lojas: { list: Array<{ id: string; active: boolean }> } };
        const store = state.lojas.list.find((s) => s.id === id);
        if (store) updateDocument(collectionName, id, { active: !store.active }).catch(console.error);
      }
      break;
    }

    case 'updateStoreProducts': {
      const { storeId, productIds } = payload as { storeId: string; productIds: string[] };
      if (storeId) updateDocument(collectionName, storeId, { productIds }).catch(console.error);
      break;
    }

    case 'markAsRead': {
      const id = typeof payload === 'string' ? payload : (payload as { id: string }).id;
      if (id) updateDocument(collectionName, id, { read: true }).catch(console.error);
      break;
    }

    case 'updateTicketStatus': {
      const { id, status } = payload as { id: string; status: string };
      const data: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
      if (status === 'resolvido') data.resolvedAt = new Date().toISOString();
      if (id) updateDocument(collectionName, id, data).catch(console.error);
      break;
    }

    case 'assignTicket': {
      const { id, assignedTo } = payload as { id: string; assignedTo: string };
      if (id) updateDocument(collectionName, id, { assignedTo, updatedAt: new Date().toISOString() }).catch(console.error);
      break;
    }

    case 'addMessage': {
      const msg = payload as { id: string; ticketId: string; [key: string]: unknown };
      if (msg.id) {
        const { id, ...data } = msg;
        createDocument('ticketMessages', data, id).catch(console.error);
      }
      break;
    }

    case 'updateTopicStatus':
    case 'updateServiceStatus': {
      const { id, status } = payload as { id: string; status: string };
      if (id) updateDocument(collectionName, id, { status }).catch(console.error);
      break;
    }

    case 'rateService': {
      const { id, rating } = payload as { id: string; rating: number };
      if (id) updateDocument(collectionName, id, { rating }).catch(console.error);
      break;
    }

    case 'updatePosition': {
      const { id, position } = payload as { id: string; position: number };
      if (id) updateDocument(collectionName, id, { position }).catch(console.error);
      break;
    }

    case 'toggleFavorite': {
      const id = typeof payload === 'string' ? payload : (payload as { id: string }).id;
      if (id) {
        const state = getState() as { relatorios: { list: Array<{ id: string; favorite: boolean }> } };
        const report = state.relatorios.list.find((r) => r.id === id);
        if (report) updateDocument(collectionName, id, { favorite: report.favorite }).catch(console.error);
      }
      break;
    }

    case 'markGenerated': {
      const id = typeof payload === 'string' ? payload : (payload as { id: string }).id;
      if (id) updateDocument(collectionName, id, { lastGenerated: new Date().toISOString() }).catch(console.error);
      break;
    }

    case 'markAllAsRead': {
      const state = getState() as { notificacoes: { list: Array<{ id: string; read: boolean }> } };
      state.notificacoes.list.filter((n) => !n.read).forEach((n) => {
        updateDocument(collectionName, n.id, { read: true }).catch(console.error);
      });
      break;
    }
  }
}

const firestoreMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const result = next(action);

  const act = action as { type: string; payload: Record<string, unknown> };
  if (!act.type || typeof act.type !== 'string') return result;

  const [sliceName, actionName] = act.type.split('/');
  const collection = COLLECTION_MAP[sliceName];
  if (!collection || !act.payload) return result;

  syncToFirestore(collection, actionName, act.payload, store.getState).catch(console.error);

  return result;
};

export default firestoreMiddleware;
