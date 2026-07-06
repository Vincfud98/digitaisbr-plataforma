import type { FinancialTransaction } from '../types';
import { mockSales } from './sales';
import { mockCommissions } from './commissions';

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

const totalEntradas = saleTransactions.reduce((s, t) => s + t.amount, 0);
const totalComissoes = commissionTransactions.reduce((s, t) => s + t.amount, 0);
const margemDisponivel = totalEntradas - totalComissoes;

const operationalCosts: FinancialTransaction[] = [
  { cat: 'Infraestrutura', pct: 0.06 },
  { cat: 'Marketing', pct: 0.05 },
  { cat: 'Suporte', pct: 0.03 },
  { cat: 'Jurídico', pct: 0.02 },
].map((item, i) => {
  const date = new Date(2025, 5, 20);
  date.setDate(date.getDate() - i * 7);

  return {
    id: `fin-op-${i + 1}`,
    type: 'saida' as const,
    category: item.cat,
    description: `${item.cat} — mensal`,
    amount: Math.round(margemDisponivel * item.pct * 100) / 100,
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
