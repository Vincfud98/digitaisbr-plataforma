import { describe, it, expect } from 'vitest';
import { planLabels, planColors, planColorsHex, planPrices } from './plans';

describe('plan constants', () => {
  it('planLabels has all three plans', () => {
    expect(planLabels.basico).toBe('Básico');
    expect(planLabels.intermediario).toBe('Intermediário');
    expect(planLabels.avancado).toBe('Avançado');
  });

  it('planColors uses Ant Design color names', () => {
    expect(planColors.basico).toBe('blue');
    expect(planColors.intermediario).toBe('purple');
    expect(planColors.avancado).toBe('gold');
  });

  it('planColorsHex uses hex values', () => {
    expect(planColorsHex.basico).toMatch(/^#[0-9a-f]{6}$/i);
    expect(planColorsHex.intermediario).toMatch(/^#[0-9a-f]{6}$/i);
    expect(planColorsHex.avancado).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('planPrices are correct', () => {
    expect(planPrices.basico).toBe(49.90);
    expect(planPrices.intermediario).toBe(99.90);
    expect(planPrices.avancado).toBe(199.90);
  });
});
