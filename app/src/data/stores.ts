import type { Store } from '../types';
import { mockAssociados } from './associados';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const colors = ['#1677ff', '#722ed1', '#f5222d', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2'];

export const mockStores: Store[] = mockAssociados
  .filter((a) => a.status === 'ativo')
  .map((a, i) => {
    const productCount = a.planType === 'avancado' ? 12 : a.planType === 'intermediario' ? 8 : 5;
    const productIds = Array.from({ length: productCount }, (_, j) => `prod-${(((i + j) * 3) % 25) + 1}`);
    const uniqueIds = [...new Set(productIds)];

    return {
      id: `store-${i + 1}`,
      associadoId: a.id,
      slug: a.storeSlug,
      name: a.storeName,
      active: seededRandom(i + 400) > 0.2,
      productIds: uniqueIds,
      config: {
        primaryColor: colors[i % colors.length],
        bannerUrl: '',
        logoUrl: '',
        description: `Loja oficial de ${a.name} na DigitaisBR.`,
        showWhatsapp: seededRandom(i + 500) > 0.4,
        whatsappNumber: a.phone,
      },
      totalViews: Math.floor(seededRandom(i + 600) * 5000),
      totalSales: a.totalSales,
      createdAt: a.createdAt,
    };
  });
