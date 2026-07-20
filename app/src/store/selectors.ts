import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

export const selectUnreadNotificationsCount = createSelector(
  (state: RootState) => state.notificacoes.list,
  (list) => list.filter((n) => !n.read).length,
);

export const selectOpenTicketsCount = createSelector(
  (state: RootState) => state.suporte.list,
  (list) => list.filter((t) => t.status === 'aberto').length,
);

export const selectActiveAssociadosCount = createSelector(
  (state: RootState) => state.associados.list,
  (list) => list.filter((a) => a.status === 'ativo').length,
);

export const selectApprovedSalesCount = createSelector(
  (state: RootState) => state.vendas.list,
  (list) => list.filter((v) => v.status === 'aprovada').length,
);

export const selectActiveStoresCount = createSelector(
  (state: RootState) => state.lojas.list,
  (list) => list.filter((l) => l.active).length,
);

export const selectTotalRevenue = createSelector(
  (state: RootState) => state.vendas.list,
  (list) => list.filter((v) => v.status !== 'cancelada').reduce((sum, v) => sum + v.totalPrice, 0),
);

export const selectPaidCommissions = createSelector(
  (state: RootState) => state.comissoes.list,
  (list) => list.filter((c) => c.status === 'paga').reduce((sum, c) => sum + c.commissionValue, 0),
);

export const selectPendingCommissions = createSelector(
  (state: RootState) => state.comissoes.list,
  (list) => list.filter((c) => c.status === 'pendente').reduce((sum, c) => sum + c.commissionValue, 0),
);

export const selectAssociadosByPlan = createSelector(
  (state: RootState) => state.associados.list,
  (list) => {
    const counts = { basico: 0, intermediario: 0, avancado: 0 };
    list.forEach((a) => {
      if (a.status === 'ativo' && a.planType in counts) {
        counts[a.planType as keyof typeof counts]++;
      }
    });
    return counts;
  },
);
