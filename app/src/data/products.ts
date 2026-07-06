import type { Product } from '../types';

export const mockProducts: Product[] = [
  // Saúde & Bem-estar (cat-1)
  {
    id: 'prod-1', name: 'Plano Odontológico Smile', description: 'Cobertura completa para consultas, limpezas e procedimentos odontológicos.',
    categoryId: 'cat-1', price: 89.90, commissionPercent: 15, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SAU-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-1', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-2', name: 'Telemedicina 24h', description: 'Acesso ilimitado a consultas médicas online 24 horas por dia.',
    categoryId: 'cat-1', price: 39.90, commissionPercent: 12, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'SAU-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-2', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-3', name: 'Plano Odontológico Familiar', description: 'Cobertura para até 4 dependentes com ortodontia inclusa.',
    categoryId: 'cat-1', price: 149.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'SAU-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-3', createdAt: '2025-05-20', updatedAt: '2025-06-15',
  },
  {
    id: 'prod-4', name: 'Assistência Psicológica Online', description: 'Sessões de terapia online com psicólogos credenciados. 4 sessões/mês.',
    categoryId: 'cat-1', price: 199.90, commissionPercent: 14, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'SAU-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-4', createdAt: '2025-06-10', updatedAt: '2025-06-20',
  },

  // Seguros (cat-2)
  {
    id: 'prod-5', name: 'Seguro de Vida Proteção Total', description: 'Seguro de vida com cobertura ampla e assistência funeral.',
    categoryId: 'cat-2', price: 59.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SEG-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-5', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-6', name: 'Seguro Equipamentos Digitais', description: 'Proteção para celular, notebook e câmera contra roubo e danos.',
    categoryId: 'cat-2', price: 29.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SEG-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-6', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-7', name: 'Seguro Acidentes Pessoais', description: 'Indenização por invalidez ou morte acidental com cobertura 24h.',
    categoryId: 'cat-2', price: 19.90, commissionPercent: 22, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SEG-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-7', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-8', name: 'Seguro Responsabilidade Civil Digital', description: 'Proteção jurídica para criadores de conteúdo contra processos online.',
    categoryId: 'cat-2', price: 49.90, commissionPercent: 25, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'SEG-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-8', createdAt: '2025-06-08', updatedAt: '2025-06-20',
  },

  // Serviços Financeiros (cat-3)
  {
    id: 'prod-9', name: 'Conta Digital PJ Sem Taxas', description: 'Conta digital empresarial com Pix ilimitado e boleto sem custo.',
    categoryId: 'cat-3', price: 0, commissionPercent: 30, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'FIN-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-9', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-10', name: 'Maquininha de Cartão Digital', description: 'Maquininha virtual para vender pelo celular. Taxa a partir de 1.99%.',
    categoryId: 'cat-3', price: 0, commissionPercent: 35, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'FIN-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-10', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-11', name: 'Antecipação de Recebíveis', description: 'Antecipe suas vendas no cartão com as menores taxas do mercado.',
    categoryId: 'cat-3', price: 0, commissionPercent: 28, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'FIN-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-11', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-12', name: 'Consultoria Contábil para MEI', description: 'Abertura de MEI/ME, declaração anual e emissão de notas fiscais.',
    categoryId: 'cat-3', price: 99.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'FIN-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-12', createdAt: '2025-06-07', updatedAt: '2025-06-20',
  },

  // Ferramentas Digitais (cat-4)
  {
    id: 'prod-13', name: 'Hospedagem Cloud VPS', description: 'Servidor VPS com 4GB RAM, 80GB SSD e suporte 24/7.',
    categoryId: 'cat-4', price: 79.90, commissionPercent: 25, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'DIG-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-13', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-14', name: 'Plataforma E-commerce SaaS', description: 'Loja virtual completa com gateway de pagamento integrado.',
    categoryId: 'cat-4', price: 199.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'DIG-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-14', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-15', name: 'Consultoria SEO Mensal', description: 'Análise e otimização mensal de SEO para seu site ou loja.',
    categoryId: 'cat-4', price: 499.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'DIG-003', stock: 10, checkoutUrl: 'https://checkout.digitaisbr.com/prod-15', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-16', name: 'Automação de Redes Sociais', description: 'Agendamento e publicação automática em Instagram, TikTok e YouTube.',
    categoryId: 'cat-4', price: 59.90, commissionPercent: 22, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'DIG-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-16', createdAt: '2025-06-08', updatedAt: '2025-06-20',
  },

  // Assinaturas & Streaming (cat-5)
  {
    id: 'prod-17', name: 'Clube de Desconto Premium', description: 'Descontos exclusivos em farmácias, restaurantes, cinemas e lojas parceiras.',
    categoryId: 'cat-5', price: 14.90, commissionPercent: 30, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'ASS-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-17', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-18', name: 'Plataforma de Audiobooks', description: 'Acesso ilimitado a mais de 10.000 audiobooks em português.',
    categoryId: 'cat-5', price: 24.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'ASS-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-18', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-19', name: 'Banco de Imagens Ilimitado', description: 'Downloads ilimitados de fotos, vetores e vídeos para uso comercial.',
    categoryId: 'cat-5', price: 49.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'ASS-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-19', createdAt: '2025-06-08', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-20', name: 'Editor de Vídeo Pro', description: 'Assinatura de editor profissional com templates para reels e shorts.',
    categoryId: 'cat-5', price: 39.90, commissionPercent: 22, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'ASS-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-20', createdAt: '2025-06-10', updatedAt: '2025-06-20',
  },

  // Viagem & Lazer (cat-6)
  {
    id: 'prod-21', name: 'Clube de Viagens com Desconto', description: 'Hotéis e passagens com até 60% de desconto para associados.',
    categoryId: 'cat-6', price: 29.90, commissionPercent: 25, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'VIA-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-21', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-22', name: 'Seguro Viagem Internacional', description: 'Cobertura médica, extravio de bagagem e cancelamento de voo.',
    categoryId: 'cat-6', price: 9.90, commissionPercent: 28, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'VIA-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-22', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-23', name: 'Coworking Pass Nacional', description: 'Acesso a mais de 500 espaços de coworking em todo o Brasil.',
    categoryId: 'cat-6', price: 149.90, commissionPercent: 15, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'VIA-003', stock: 50, checkoutUrl: 'https://checkout.digitaisbr.com/prod-23', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },

  // Conectividade (cat-7)
  {
    id: 'prod-24', name: 'Chip de Internet 50GB', description: 'Chip de dados 4G/5G com 50GB mensais. Sem fidelidade.',
    categoryId: 'cat-7', price: 49.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'CON-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-24', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-25', name: 'VPN Profissional Anual', description: 'VPN ilimitada com servidores em 60 países. Proteção total online.',
    categoryId: 'cat-7', price: 119.90, commissionPercent: 30, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'CON-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-25', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
];
