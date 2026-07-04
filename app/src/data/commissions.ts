import type { Commission } from '../types';
import { mockSales } from './sales';
import { mockProducts } from './products';

const productMap = Object.fromEntries(mockProducts.map((p) => [p.id, p]));

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const mockCommissions: Commission[] = mockSales
  .filter((s) => s.status === 'aprovada' || s.status === 'pendente')
  .map((sale, i) => {
    const product = productMap[sale.productId];
    const percent = product?.commissionPercent ?? 10;
    const value = Math.round(sale.totalPrice * percent) / 100;
    const isPaid = sale.status === 'aprovada' && seededRandom(i + 1300) > 0.4;
    const status: Commission['status'] = sale.status === 'pendente' ? 'pendente' : isPaid ? 'paga' : 'aprovada';

    const paidDate = isPaid ? new Date(sale.createdAt) : null;
    if (paidDate) paidDate.setDate(paidDate.getDate() + Math.floor(seededRandom(i + 1400) * 15) + 5);

    return {
      id: `comm-${i + 1}`,
      saleId: sale.id,
      associadoId: sale.associadoId,
      productId: sale.productId,
      saleAmount: sale.totalPrice,
      commissionPercent: percent,
      commissionValue: value,
      status,
      paidAt: paidDate ? paidDate.toISOString().split('T')[0] : null,
      createdAt: sale.createdAt,
    };
  });
