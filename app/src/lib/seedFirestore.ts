import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { plans } from '../data/plans';
import { categories } from '../data/categories';
import { mockProducts } from '../data/products';
import { mockStores } from '../data/stores';
import { mockSales } from '../data/sales';
import { mockCommissions } from '../data/commissions';
import { mockTransactions } from '../data/financial';
import { mockBenefits } from '../data/benefits';
import { mockPartners } from '../data/partners';
import { mockContents } from '../data/contents';
import { notifications } from '../data/notifications';
import { serviceRequests } from '../data/services';
import { highlights } from '../data/highlights';
import { supportTickets } from '../data/tickets';
import { reportConfigs } from '../data/reports';
import { forumTopics } from '../data/forum';
import { mockAssociados } from '../data/associados';
import { batchWrite } from './firestoreService';

export async function seedIfNeeded(): Promise<boolean> {
  try {
    const flag = await getDoc(doc(db, '_meta', 'seeded'));
    if (flag.exists()) return false;
  } catch {
    return false;
  }

  try {
    const allOps: Array<{ type: 'set'; collection: string; docId: string; data: Record<string, unknown> }> = [];

    const addBatch = (col: string, items: Array<Record<string, unknown>>) => {
      for (const item of items) {
        const id = (item.id as string) || `${col}-${allOps.length}`;
        const { id: _, ...data } = item;
        allOps.push({ type: 'set', collection: col, docId: id, data: { ...data, id } });
      }
    };

    addBatch('plans', plans as unknown as Record<string, unknown>[]);
    addBatch('categories', categories as unknown as Record<string, unknown>[]);
    addBatch('products', mockProducts as unknown as Record<string, unknown>[]);
    addBatch('stores', mockStores as unknown as Record<string, unknown>[]);
    addBatch('associados', mockAssociados as unknown as Record<string, unknown>[]);
    addBatch('sales', mockSales as unknown as Record<string, unknown>[]);
    addBatch('commissions', mockCommissions as unknown as Record<string, unknown>[]);
    addBatch('financial', mockTransactions as unknown as Record<string, unknown>[]);
    addBatch('benefits', mockBenefits as unknown as Record<string, unknown>[]);
    addBatch('partners', mockPartners as unknown as Record<string, unknown>[]);
    addBatch('contents', mockContents as unknown as Record<string, unknown>[]);
    addBatch('notifications', notifications as unknown as Record<string, unknown>[]);
    addBatch('services', serviceRequests as unknown as Record<string, unknown>[]);
    addBatch('highlights', highlights as unknown as Record<string, unknown>[]);
    addBatch('tickets', supportTickets as unknown as Record<string, unknown>[]);
    addBatch('reports', reportConfigs as unknown as Record<string, unknown>[]);
    addBatch('forumTopics', forumTopics as unknown as Record<string, unknown>[]);

    const BATCH_SIZE = 490;
    for (let i = 0; i < allOps.length; i += BATCH_SIZE) {
      await batchWrite(allOps.slice(i, i + BATCH_SIZE));
    }

    await setDoc(doc(db, '_meta', 'seeded'), { seededAt: new Date().toISOString(), count: allOps.length });
    console.log(`Firestore seeded with ${allOps.length} documents.`);
    return true;
  } catch (err) {
    console.error('Seed failed:', err);
    return false;
  }
}
