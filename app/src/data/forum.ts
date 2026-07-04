import type { ForumTopic } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}


const topics: { title: string; category: string }[] = [
  { title: 'Como aumentei minhas vendas em 300% em 3 meses', category: 'Dicas de Vendas' },
  { title: 'Melhores estratégias de Instagram para lojas', category: 'Marketing Digital' },
  { title: 'Dúvida sobre comissões de produtos exclusivos', category: 'Gestão Financeira' },
  { title: 'Sugestão: adicionar filtro por região nas lojas', category: 'Sugestões' },
  { title: 'Novo catálogo de produtos de tecnologia!', category: 'Novidades' },
  { title: 'Como precificar serviços digitais corretamente', category: 'Gestão Financeira' },
  { title: 'Grupo de WhatsApp para associados do plano Avançado', category: 'Geral' },
  { title: 'Tutorial: Personalizando sua loja virtual', category: 'Dicas de Vendas' },
  { title: 'Feedback sobre o novo sistema de benefícios', category: 'Sugestões' },
  { title: 'Como usar SEO para atrair mais clientes', category: 'Marketing Digital' },
  { title: 'Problema com link de checkout - alguém mais?', category: 'Produtos' },
  { title: 'Evento online: Workshop de Empreendedorismo', category: 'Novidades' },
  { title: 'Dica: use o cashback para reinvestir na loja', category: 'Dicas de Vendas' },
  { title: 'Comparativo dos planos - vale o upgrade?', category: 'Geral' },
  { title: 'Novos parceiros na área de saúde', category: 'Novidades' },
  { title: 'Como organizar o estoque de forma eficiente', category: 'Produtos' },
  { title: 'Resultados da promoção de Junho', category: 'Marketing Digital' },
  { title: 'Sugestão: integração com Mercado Livre', category: 'Sugestões' },
  { title: 'Alguém usa o serviço jurídico? Como funciona?', category: 'Geral' },
  { title: 'Top 5 produtos mais vendidos este mês', category: 'Dicas de Vendas' },
];

const authors = [
  'Maria Silva', 'João Santos', 'Ana Oliveira', 'Carlos Mendes', 'Juliana Costa',
  'Pedro Lima', 'Fernanda Souza', 'Ricardo Alves', 'Camila Ferreira', 'Bruno Rocha',
];

export const forumTopics: ForumTopic[] = topics.map((t, i) => {
  const seed = i + 1;
  const statusRoll = seededRandom(seed * 7);
  const dayOffset = Math.floor(seededRandom(seed * 3) * 60);
  const date = new Date(2025, 4, 1);
  date.setDate(date.getDate() + dayOffset);

  return {
    id: `topic-${String(i + 1).padStart(3, '0')}`,
    title: t.title,
    body: `Conteúdo do tópico: ${t.title}`,
    authorId: `assoc-${String((i % 10) + 1).padStart(3, '0')}`,
    authorName: authors[i % authors.length],
    category: t.category,
    status: statusRoll > 0.85 ? 'fixado' : statusRoll > 0.2 ? 'aberto' : 'fechado',
    replies: Math.floor(seededRandom(seed * 11) * 25),
    views: Math.floor(seededRandom(seed * 13) * 500) + 10,
    likes: Math.floor(seededRandom(seed * 17) * 50),
    lastReplyAt: seededRandom(seed * 19) > 0.3 ? new Date(date.getTime() + 86400000 * Math.floor(seededRandom(seed * 23) * 10)).toISOString() : null,
    createdAt: date.toISOString(),
  };
});
