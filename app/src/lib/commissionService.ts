import { createDocument, updateDocument } from './firestoreService';
import type { Commission, Sale, Product } from '../types';

export function calculateCommission(sale: Sale, product: Product): number {
  return (sale.totalPrice * product.commissionPercent) / 100;
}

export async function createCommissionForSale(
  sale: Sale,
  product: Product
): Promise<Commission> {
  const commissionValue = calculateCommission(sale, product);
  const commission: Omit<Commission, 'id'> = {
    saleId: sale.id,
    associadoId: sale.associadoId,
    productId: sale.productId,
    saleAmount: sale.totalPrice,
    commissionPercent: product.commissionPercent,
    commissionValue,
    status: 'pendente',
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  const id = await createDocument('commissions', commission);
  return { ...commission, id };
}

export async function approveCommission(commissionId: string): Promise<void> {
  await updateDocument('commissions', commissionId, { status: 'aprovada' });
}

export async function payCommission(commissionId: string): Promise<void> {
  await updateDocument('commissions', commissionId, {
    status: 'paga',
    paidAt: new Date().toISOString(),
  });
}
