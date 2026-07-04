import type { FinancialTransaction } from '../types';
import { mockSales } from './sales';
import { mockCommissions } from './commissions';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const approvedSales = mockSales.filter((s) => s.status === 'aprovada');
const paidCommissions = mockCommissions.filter((c) => c.status === 'paga');

const saleTransactions: FinancialTransaction[] = approvedSales.map((s, i) => ({
  id: `fin-e-${i + 1}`,
  type: 'entrada',
  category: 'Venda',
  description: `Venda ${s.checkoutRef} — ${s.customerName}`,
  amount: s.totalPrice,
  associadoId: s.associadoId,
  referenceId: s.id,
  createdAt: s.createdAt,
}));

const commissionTransactions: FinancialTransaction[] = paidCommissions.map((c, i) => ({
  id: `fin-s-${i + 1}`,
  type: 'saida',
  category: 'Comissão',
  description: `Comissão ${c.id} paga`,
  amount: c.commissionValue,
  associadoId: c.associadoId,
  referenceId: c.saleId,
  createdAt: c.paidAt!,
}));

const operationalCosts: FinancialTransaction[] = Array.from({ length: 12 }, (_, i) => {
  const categories = ['Infraestrutura', 'Marketing', 'Suporte', 'Jurídico'];
  const cat = categories[i % categories.length];
  const amount = Math.round((seededRandom(i + 1500) * 3000 + 500) * 100) / 100;
  const date = new Date(2025, 5, 20);
  date.setDate(date.getDate() - i * 7);

  return {
    id: `fin-op-${i + 1}`,
    type: 'saida' as const,
    category: cat,
    description: `${cat} — semana ${i + 1}`,
    amount,
    associadoId: null,
    referenceId: null,
    createdAt: date.toISOString().split('T')[0],
  };
});

export const mockTransactions: FinancialTransaction[] = [
  ...saleTransactions,
  ...commissionTransactions,
  ...operationalCosts,
].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
