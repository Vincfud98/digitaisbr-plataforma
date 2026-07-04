import type { HighlightItem } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const items: { type: 'loja' | 'produto'; refId: string; title: string; subtitle: string }[] = [
  { type: 'loja', refId: 'store-003', title: 'Tech Store Premium', subtitle: 'Produtos de tecnologia com os melhores preços' },
  { type: 'produto', refId: 'prod-001', title: 'Kit Premium Saúde', subtitle: 'Vitaminas e suplementos selecionados' },
  { type: 'loja', refId: 'store-007', title: 'Moda & Estilo', subtitle: 'Roupas e acessórios exclusivos' },
  { type: 'produto', refId: 'prod-005', title: 'Curso de Marketing Digital', subtitle: 'Aprenda a vender mais online' },
  { type: 'loja', refId: 'store-010', title: 'Casa & Decoração BR', subtitle: 'Transforme seu lar com estilo' },
  { type: 'produto', refId: 'prod-012', title: 'Smartphone XR Pro', subtitle: 'Tecnologia de ponta por menos' },
  { type: 'loja', refId: 'store-005', title: 'Saúde Natural', subtitle: 'Produtos naturais e orgânicos' },
  { type: 'produto', refId: 'prod-018', title: 'Planner Digital 2025', subtitle: 'Organize sua vida e seus negócios' },
  { type: 'loja', refId: 'store-012', title: 'EduConnect', subtitle: 'Cursos e treinamentos profissionais' },
  { type: 'produto', refId: 'prod-022', title: 'Consultoria Empresarial', subtitle: 'Assessoria para crescer seu negócio' },
  { type: 'loja', refId: 'store-015', title: 'Gourmet Delivery', subtitle: 'Alimentos artesanais e gourmet' },
  { type: 'produto', refId: 'prod-008', title: 'Cadeira Ergonômica Pro', subtitle: 'Conforto para o home office' },
];

export const highlights: HighlightItem[] = items.map((item, i) => {
  const seed = i + 1;
  const dayOffset = Math.floor(seededRandom(seed * 3) * 30);
  const startDate = new Date(2025, 5, 1);
  startDate.setDate(startDate.getDate() + dayOffset);

  return {
    id: `highlight-${String(i + 1).padStart(3, '0')}`,
    type: item.type,
    referenceId: item.refId,
    title: item.title,
    subtitle: item.subtitle,
    image: '',
    position: i + 1,
    active: seededRandom(seed * 7) > 0.25,
    clicks: Math.floor(seededRandom(seed * 11) * 500) + 20,
    impressions: Math.floor(seededRandom(seed * 13) * 5000) + 500,
    startDate: startDate.toISOString(),
    endDate: seededRandom(seed * 17) > 0.4 ? new Date(startDate.getTime() + 86400000 * 30).toISOString() : null,
    createdAt: startDate.toISOString(),
  };
});
