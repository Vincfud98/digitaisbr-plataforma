import type { ForumTopic } from '../types';

const posts: { title: string; body: string; category: string }[] = [
  {
    title: 'Como aumentei minhas vendas em 300% em 3 meses',
    body: 'Pessoal, quero compartilhar minha experiência. Comecei aplicando técnicas de copywriting nos meus posts e criei uma rotina de stories diários mostrando os produtos. O segredo foi consistência + storytelling. No primeiro mês subiu 80%, no segundo 150%, e no terceiro explodiu. Quem quiser trocar ideia, bora! 🚀',
    category: 'Dicas de Vendas',
  },
  {
    title: 'Estratégia de Reels que está funcionando demais',
    body: 'Descobri que reels de 15-20 segundos com texto na tela convertem MUITO mais que vídeos longos. Formato: problema → solução → CTA. Meu engajamento triplicou em 2 semanas. Alguém mais testou esse formato?',
    category: 'Marketing Digital',
  },
  {
    title: 'Saí do CLT e estou faturando 3x mais como associado',
    body: 'Faz 6 meses que larguei o emprego e mergulhei 100% na plataforma. No começo deu medo, mas com o suporte da comunidade e os treinamentos, hoje faturo 3x o que ganhava. A dica é: comece como renda extra antes de dar o salto. Minha jornada foi assim...',
    category: 'Experiências',
  },
  {
    title: 'Dica de ouro: como precificar seus serviços digitais',
    body: 'Muita gente erra na precificação. A regra que uso: custo do produto + 30% margem + comissão da plataforma + imposto. Nunca precifique pelo "quanto eu acho que vale". Precifique pelo valor que entrega. Compartilho minha planilha com quem quiser.',
    category: 'Gestão Financeira',
  },
  {
    title: '🎉 Workshop gratuito de Empreendedorismo Digital - 15/07',
    body: 'Galera, a plataforma vai promover um workshop online e gratuito sobre empreendedorismo digital no dia 15/07 às 19h. Vamos falar sobre construção de marca pessoal, funis de venda e automação. Quem topa? Comenta aqui que envio o link!',
    category: 'Eventos',
  },
  {
    title: 'Erros que cometi no primeiro ano e como evitar',
    body: '1) Não investir em fotos boas dos produtos\n2) Ignorar o pós-venda\n3) Não usar o cupom de desconto para fidelizar\n4) Tentar vender tudo pra todo mundo\n5) Não participar da comunidade\n\nSe eu tivesse entrado aqui antes, teria economizado uns 6 meses de tentativa e erro.',
    category: 'Experiências',
  },
  {
    title: 'Tutorial: Como personalizar sua loja e vender mais',
    body: 'Fiz um passo a passo de como configurei minha loja pra converter mais. O segredo está no banner, na organização dos produtos por categoria e na descrição com gatilhos mentais. Vou postar prints nos comentários.',
    category: 'Dicas de Vendas',
  },
  {
    title: 'Quem já usou a assessoria jurídica? Vale a pena?',
    body: 'Preciso regularizar meu CNPJ e vi que temos assessoria jurídica na plataforma. Alguém já usou? Como foi a experiência? Demora muito? Quanto custa?',
    category: 'Dúvidas',
  },
  {
    title: 'Resultado do mês: R$ 12.400 em vendas 💰',
    body: 'Melhor mês desde que entrei na plataforma! O que fiz diferente: criei kits de produtos, fiz lives semanais e usei os cupons de forma estratégica. Obrigado a todos da comunidade pelas dicas. Vocês são incríveis!',
    category: 'Conquistas',
  },
  {
    title: 'Como usar SEO para atrair clientes sem gastar com anúncio',
    body: 'Muita gente acha que precisa investir pesado em tráfego pago, mas SEO orgânico funciona demais. Eu otimizei minha loja com palavras-chave certas e hoje 40% do meu tráfego é orgânico. Vou explicar o passo a passo...',
    category: 'Marketing Digital',
  },
  {
    title: 'Sugestão: integração com Mercado Livre e Shopee',
    body: 'Seria incrível se a plataforma tivesse integração direta com Mercado Livre e Shopee. Muitos de nós vendemos lá também e ter tudo centralizado seria um game changer. O que vocês acham?',
    category: 'Sugestões',
  },
  {
    title: 'Minha rotina como criador digital - um dia típico',
    body: '6h: Acordo e checo pedidos\n8h: Criação de conteúdo (3 posts + 1 reel)\n10h: Respondo mensagens e faço pós-venda\n12h: Almoço\n14h: Estudo (curso da plataforma)\n16h: Lives ou gravações\n18h: Análise de métricas\n\nE vocês, como é a rotina?',
    category: 'Experiências',
  },
  {
    title: 'Top 5 produtos mais vendidos este mês',
    body: 'Compartilhando os campeões de venda da minha loja:\n1. Kit Skincare Natural - 45 vendas\n2. Camiseta Premium - 38 vendas\n3. Acessório Tech - 32 vendas\n4. Suplemento Fitness - 28 vendas\n5. Curso Online Marketing - 24 vendas\n\nQuais são os de vocês?',
    category: 'Dicas de Vendas',
  },
  {
    title: 'Novos parceiros na área de saúde e bem-estar! 🏥',
    body: 'Acabei de ver que a plataforma fechou parceria com 3 marcas novas de saúde e bem-estar. Produtos de altíssima qualidade com margens ótimas. Já adicionei à minha loja. Quem quiser dicas de como posicionar esses produtos, comenta aí!',
    category: 'Novidades',
  },
  {
    title: 'Feedback: o novo sistema de benefícios está excelente',
    body: 'Quero parabenizar a equipe pelo novo sistema de benefícios. A interface ficou muito mais intuitiva e os descontos estão realmente vantajosos. Já economizei R$ 300 esse mês só com os convênios. Continuem assim! 👏',
    category: 'Sugestões',
  },
  {
    title: 'Como lidar com clientes difíceis - compartilhem experiências',
    body: 'Tive uma situação complicada com um cliente que queria devolver um produto após 30 dias de uso. Como vocês lidam com esse tipo de situação? Qual a política de vocês? Quero melhorar meu atendimento.',
    category: 'Dúvidas',
  },
  {
    title: '🏆 Cheguei no Top 10 do ranking! Obrigado comunidade!',
    body: 'Não acredito que consegui! Quando entrei há 8 meses, mal sabia fazer um post. Hoje estou no top 10 graças às dicas dessa comunidade. Prova de que compartilhar conhecimento funciona. Gratidão a todos!',
    category: 'Conquistas',
  },
  {
    title: 'Comparativo: tráfego pago vs orgânico para lojas digitais',
    body: 'Testei durante 3 meses os dois modelos com o mesmo orçamento de tempo. Resultado: tráfego pago dá resultado imediato mas para quando você para. Orgânico demora mas é sustentável. Minha recomendação: comece com pago pra validar, depois migre pra orgânico.',
    category: 'Marketing Digital',
  },
  {
    title: 'Alguém mais está animado com a Black Friday?',
    body: 'Já comecei a planejar minha estratégia de Black Friday. Vou criar kits especiais, cupons progressivos e fazer uma semana de lives. Bora trocar ideias e montar estratégias juntos? Podemos criar um grupo focado nisso.',
    category: 'Eventos',
  },
  {
    title: 'Dica: use o cashback para reinvestir e crescer mais rápido',
    body: 'Descobri que reinvestindo 100% do cashback em estoque e marketing, meu crescimento acelerou muito. Em vez de sacar, eu reinvisto. Em 4 meses meu faturamento dobrou. Parece contraintuitivo, mas funciona.',
    category: 'Dicas de Vendas',
  },
];

const authors = [
  { name: 'Maria Silva', plan: 'avancado' },
  { name: 'João Santos', plan: 'intermediario' },
  { name: 'Ana Oliveira', plan: 'avancado' },
  { name: 'Carlos Mendes', plan: 'basico' },
  { name: 'Juliana Costa', plan: 'avancado' },
  { name: 'Pedro Lima', plan: 'intermediario' },
  { name: 'Fernanda Souza', plan: 'avancado' },
  { name: 'Ricardo Alves', plan: 'intermediario' },
  { name: 'Camila Ferreira', plan: 'basico' },
  { name: 'Bruno Rocha', plan: 'avancado' },
];

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

export const forumTopics: ForumTopic[] = posts.map((p, i) => {
  const seed = i + 1;
  const statusRoll = seededRandom(seed * 7);
  const dayOffset = Math.floor(seededRandom(seed * 3) * 30);
  const date = new Date(2025, 5, 1);
  date.setDate(date.getDate() + dayOffset);

  return {
    id: `post-${String(i + 1).padStart(3, '0')}`,
    title: p.title,
    body: p.body,
    authorId: `assoc-${String((i % 10) + 1).padStart(3, '0')}`,
    authorName: authors[i % authors.length].name,
    category: p.category,
    status: statusRoll > 0.85 ? 'fixado' : 'aberto',
    replies: Math.floor(seededRandom(seed * 11) * 30) + 2,
    views: Math.floor(seededRandom(seed * 13) * 800) + 50,
    likes: Math.floor(seededRandom(seed * 17) * 60) + 3,
    lastReplyAt: new Date(date.getTime() + 86400000 * Math.floor(seededRandom(seed * 23) * 5 + 1)).toISOString(),
    createdAt: date.toISOString(),
  };
});
