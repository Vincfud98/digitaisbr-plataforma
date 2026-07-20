import type { ForumTopic } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const posts: { title: string; body: string; category: string; authorRole?: string; media?: { type: 'image' | 'video'; url: string; caption?: string }[] }[] = [
  {
    title: 'Como aumentei minhas vendas em 300% em 3 meses',
    body: 'Pessoal, quero compartilhar minha experiência. Comecei aplicando técnicas de copywriting nos meus posts e criei uma rotina de stories diários mostrando os produtos. O segredo foi consistência + storytelling.\n\nNo primeiro mês subiu 80%, no segundo 150%, e no terceiro explodiu. Quem quiser trocar ideia, bora! 🚀',
    category: 'Dicas de Vendas',
    authorRole: 'Top Seller · Plano Avançado',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', caption: 'Gráfico de crescimento mensal' },
      { type: 'image', url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', caption: 'Dashboard de vendas' },
    ],
  },
  {
    title: 'Estratégia de Reels que está funcionando demais',
    body: 'Descobri que reels de 15-20 segundos com texto na tela convertem MUITO mais que vídeos longos. Formato: problema → solução → CTA. Meu engajamento triplicou em 2 semanas.\n\nAlguém mais testou esse formato? Deixa nos comentários!',
    category: 'Marketing Digital',
    authorRole: 'Criadora de Conteúdo',
    media: [
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Tutorial: Como criar Reels que vendem' },
    ],
  },
  {
    title: 'Saí do CLT e estou faturando 3x mais como associado',
    body: 'Faz 6 meses que larguei o emprego e mergulhei 100% na plataforma. No começo deu medo, mas com o suporte da comunidade e os treinamentos, hoje faturo 3x o que ganhava.\n\nA dica é: comece como renda extra antes de dar o salto. O plano Avançado foi essencial pra mim.',
    category: 'Experiências',
    authorRole: 'Empreendedor Digital',
  },
  {
    title: 'Minha planilha de precificação — download grátis!',
    body: 'Muita gente erra na precificação. A regra que uso:\n\n✅ Custo do produto + 30% margem\n✅ Comissão da plataforma\n✅ Impostos\n✅ Frete médio\n\nNunca precifique pelo "quanto eu acho que vale". Precifique pelo valor que entrega. Fiz uma planilha automatizada, quem quiser é só comentar!',
    category: 'Gestão Financeira',
    authorRole: 'Consultor Financeiro',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', caption: 'Preview da planilha de precificação' },
    ],
  },
  {
    title: '🎉 Workshop gratuito de Empreendedorismo Digital - 15/07',
    body: 'Galera, a plataforma vai promover um workshop online e gratuito sobre empreendedorismo digital no dia 15/07 às 19h.\n\n📌 Temas:\n• Construção de marca pessoal\n• Funis de venda\n• Automação de marketing\n\nQuem topa? Comenta aqui que envio o link!',
    category: 'Eventos',
    authorRole: 'Equipe DigitaisBR',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)', caption: 'Banner do Workshop - 15/07 às 19h' },
    ],
  },
  {
    title: '5 erros que me custaram R$ 10.000 no primeiro ano',
    body: '1️⃣ Não investir em fotos boas dos produtos\n2️⃣ Ignorar o pós-venda\n3️⃣ Não usar cupom de desconto para fidelizar\n4️⃣ Tentar vender tudo pra todo mundo\n5️⃣ Não participar da comunidade\n\nSe eu tivesse entrado aqui antes, teria economizado uns 6 meses de tentativa e erro. Aprenda com meus erros!',
    category: 'Experiências',
    authorRole: 'Vendedor · 2 anos na plataforma',
  },
  {
    title: 'Antes e depois da minha loja — resultados reais',
    body: 'Resolvi compartilhar a evolução da minha loja. A primeira imagem é de quando comecei (layout padrão, sem identidade). A segunda é como está hoje após aplicar as dicas da comunidade.\n\nAs vendas subiram 240% só com a mudança visual. Branding importa DEMAIS!',
    category: 'Dicas de Vendas',
    authorRole: 'Designer & Vendedora',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', caption: 'ANTES — Loja sem identidade visual' },
      { type: 'image', url: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', caption: 'DEPOIS — Loja com branding profissional' },
    ],
  },
  {
    title: 'Quem já usou a assessoria jurídica? Vale a pena?',
    body: 'Preciso regularizar meu CNPJ e vi que temos assessoria jurídica na plataforma. Alguém já usou? Como foi a experiência? Demora muito? Quanto custa?\n\nTambém preciso de ajuda com contrato de parceria. Se alguém tiver modelo, agradeço!',
    category: 'Dúvidas',
    authorRole: 'Associado · Plano Intermediário',
  },
  {
    title: '🏆 R$ 12.400 em vendas neste mês — meu recorde!',
    body: 'Melhor mês desde que entrei na plataforma! O que fiz diferente:\n\n🎯 Criei kits de produtos (combo = ticket médio maior)\n📱 Fiz lives semanais mostrando os produtos\n🏷️ Usei cupons de forma estratégica (desconto progressivo)\n\nObrigado a todos da comunidade pelas dicas. Vocês são incríveis! 🚀',
    category: 'Conquistas',
    authorRole: 'Top 5 Vendedores do Mês',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', caption: 'Dashboard — R$ 12.400 em junho' },
    ],
  },
  {
    title: 'Tutorial completo: SEO para sua loja digital',
    body: 'Muita gente acha que precisa investir pesado em tráfego pago, mas SEO orgânico funciona demais. Eu otimizei minha loja com palavras-chave certas e hoje 40% do meu tráfego é orgânico.\n\nGravei um vídeo explicando passo a passo. Assistam e me digam o que acharam!',
    category: 'Marketing Digital',
    authorRole: 'Especialista em SEO',
    media: [
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Tutorial: SEO para lojas digitais em 15 minutos' },
    ],
  },
  {
    title: 'Sugestão: integração com Mercado Livre e Shopee',
    body: 'Seria incrível se a plataforma tivesse integração direta com Mercado Livre e Shopee. Muitos de nós vendemos lá também e ter tudo centralizado seria um game changer.\n\nQuem concorda dá um like pra gente dar visibilidade pra essa sugestão! 👇',
    category: 'Sugestões',
    authorRole: 'Associado · Multicanal',
  },
  {
    title: 'Minha rotina como criador digital — um dia típico',
    body: '⏰ 6h: Acordo e checo pedidos do dia anterior\n📸 8h: Criação de conteúdo (3 posts + 1 reel)\n💬 10h: Respondo mensagens e faço pós-venda\n🍽️ 12h: Almoço\n📚 14h: Estudo (curso da plataforma)\n🎥 16h: Lives ou gravações\n📊 18h: Análise de métricas e planejamento\n\nE vocês, como é a rotina? Compartilhem!',
    category: 'Experiências',
    authorRole: 'Criador Full-time',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', caption: 'Meu setup de trabalho' },
    ],
  },
  {
    title: 'Top 5 produtos mais vendidos da minha loja',
    body: 'Compartilhando os campeões de venda:\n\n🥇 Kit Skincare Natural — 45 vendas\n🥈 Camiseta Premium — 38 vendas\n🥉 Acessório Tech — 32 vendas\n4️⃣ Suplemento Fitness — 28 vendas\n5️⃣ Curso Online Marketing — 24 vendas\n\nQuais são os top 5 de vocês? Bora trocar!',
    category: 'Dicas de Vendas',
    authorRole: 'Vendedora · 167 vendas/mês',
  },
  {
    title: 'Novos parceiros na área de saúde e bem-estar! 🏥',
    body: 'Acabei de ver que a plataforma fechou parceria com 3 marcas novas de saúde e bem-estar. Produtos de altíssima qualidade com margens ótimas.\n\nJá adicionei à minha loja. Quem quiser dicas de como posicionar esses produtos no nicho fitness, comenta aí!',
    category: 'Novidades',
    authorRole: 'Nicho: Saúde & Fitness',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', caption: 'Novos produtos de saúde disponíveis' },
      { type: 'image', url: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', caption: 'Margens de lucro dos novos produtos' },
    ],
  },
  {
    title: 'O novo sistema de benefícios está excelente 👏',
    body: 'Quero parabenizar a equipe pelo novo sistema de benefícios. A interface ficou muito mais intuitiva e os descontos estão realmente vantajosos.\n\nJá economizei R$ 300 esse mês só com os convênios da assessoria contábil. Continuem assim!',
    category: 'Sugestões',
    authorRole: 'Associada · Plano Avançado',
  },
  {
    title: 'Como lidar com clientes difíceis — compartilhem!',
    body: 'Tive uma situação complicada com um cliente que queria devolver um produto após 30 dias de uso. Como vocês lidam com esse tipo de situação?\n\nQual a política de devolução de vocês? Quero melhorar meu atendimento e reduzir conflitos. Toda dica é bem-vinda!',
    category: 'Dúvidas',
    authorRole: 'Associado · Atendimento ao Cliente',
  },
  {
    title: '🏆 Cheguei no Top 10 do ranking! Obrigado comunidade!',
    body: 'Não acredito que consegui! Quando entrei há 8 meses, mal sabia fazer um post no Instagram. Hoje estou no top 10 do ranking mensal.\n\nGratidão a todos que compartilham conhecimento aqui. Prova de que comunidade forte faz a diferença! 💪',
    category: 'Conquistas',
    authorRole: 'Top 10 Ranking Mensal',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', caption: 'Meu badge Top 10 🏆' },
    ],
  },
  {
    title: 'Tráfego pago vs orgânico — testei por 3 meses',
    body: 'Resultado do meu teste de 3 meses:\n\n💰 Tráfego Pago:\n• Resultado imediato\n• Para quando você para de investir\n• ROI: 3.2x\n\n🌱 Tráfego Orgânico:\n• Demora 30-60 dias pra começar\n• Sustentável a longo prazo\n• ROI: 8.5x (após 90 dias)\n\nMinha recomendação: comece com pago pra validar o produto, depois migre pra orgânico.',
    category: 'Marketing Digital',
    authorRole: 'Gestor de Tráfego',
    media: [
      { type: 'image', url: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', caption: 'Comparativo de ROI — Pago vs Orgânico' },
    ],
  },
  {
    title: 'Quem vai na Black Friday? Bora montar estratégia!',
    body: 'Já comecei a planejar minha estratégia de Black Friday:\n\n📦 Kits especiais com desconto\n🏷️ Cupons progressivos (compre mais, desconto maior)\n📱 Semana de lives com demonstração\n📧 Sequência de emails de aquecimento\n\nBora criar um grupo focado nisso? Quem topa, comenta! 🖤',
    category: 'Eventos',
    authorRole: 'Planejamento Estratégico',
  },
  {
    title: 'Dica de ouro: reinvista 100% do cashback',
    body: 'Descobri que reinvestindo 100% do cashback em estoque e marketing, meu crescimento acelerou absurdamente.\n\nEm vez de sacar, eu reinvisto. Em 4 meses meu faturamento dobrou. Parece contraintuitivo, mas funciona. O dinheiro trabalhando pra você! 💡',
    category: 'Dicas de Vendas',
    authorRole: 'Estrategista de Crescimento',
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

export const forumTopics: ForumTopic[] = posts.map((p, i) => {
  const seed = i + 1;
  const statusRoll = seededRandom(seed * 7);
  const dayOffset = Math.floor(seededRandom(seed * 3) * 20);
  const date = new Date(2025, 5, 10);
  date.setDate(date.getDate() + dayOffset);

  return {
    id: `post-${String(i + 1).padStart(3, '0')}`,
    title: p.title,
    body: p.body,
    authorId: `assoc-${String((i % 10) + 1).padStart(3, '0')}`,
    authorName: authors[i % authors.length].name,
    authorRole: p.authorRole || '',
    category: p.category,
    status: statusRoll > 0.85 ? 'fixado' : 'aberto',
    replies: Math.floor(seededRandom(seed * 11) * 30) + 2,
    views: Math.floor(seededRandom(seed * 13) * 800) + 50,
    likes: Math.floor(seededRandom(seed * 17) * 60) + 3,
    lastReplyAt: new Date(date.getTime() + 86400000 * Math.floor(seededRandom(seed * 23) * 5 + 1)).toISOString(),
    createdAt: date.toISOString(),
    media: p.media || [],
  };
});
