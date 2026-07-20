import type { PlanType } from '../types';

export const planLabels: Record<PlanType, string> & Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const planColors: Record<PlanType, string> & Record<string, string> = {
  basico: 'blue',
  intermediario: 'purple',
  avancado: 'gold',
};

export const planColorsHex: Record<PlanType, string> & Record<string, string> = {
  basico: '#1677ff',
  intermediario: '#722ed1',
  avancado: '#faad14',
};

export const planPrices: Record<PlanType, number> & Record<string, number> = {
  basico: 49.90,
  intermediario: 99.90,
  avancado: 199.90,
};
