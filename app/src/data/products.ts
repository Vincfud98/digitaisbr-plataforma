import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-1', name: 'Plano Odontológico Smile', description: 'Cobertura completa para consultas, limpezas e procedimentos odontológicos.',
    categoryId: 'cat-1', price: 89.90, commissionPercent: 15, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SAU-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-1', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-2', name: 'Seguro de Vida Proteção Total', description: 'Seguro de vida com cobertura ampla e assistência funeral.',
    categoryId: 'cat-1', price: 59.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'SAU-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-2', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-3', name: 'Telemedicina 24h', description: 'Acesso ilimitado a consultas médicas online 24 horas.',
    categoryId: 'cat-1', price: 39.90, commissionPercent: 12, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'SAU-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-3', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-4', name: 'Curso Excel Avançado', description: 'Do básico ao avançado com dashboards, macros e VBA.',
    categoryId: 'cat-2', price: 197.00, commissionPercent: 30, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'EDU-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-4', createdAt: '2025-05-15', updatedAt: '2025-06-18',
  },
  {
    id: 'prod-5', name: 'MBA Gestão Empresarial Online', description: 'Pós-graduação 100% online reconhecida pelo MEC.',
    categoryId: 'cat-2', price: 299.90, commissionPercent: 25, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'EDU-002', stock: 50, checkoutUrl: 'https://checkout.digitaisbr.com/prod-5', createdAt: '2025-05-10', updatedAt: '2025-06-15',
  },
  {
    id: 'prod-6', name: 'Curso Marketing Digital', description: 'Estratégias de tráfego pago, SEO e redes sociais.',
    categoryId: 'cat-2', price: 147.00, commissionPercent: 28, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'EDU-003', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-6', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-7', name: 'Notebook Acer Aspire 5', description: 'Intel Core i5, 8GB RAM, SSD 256GB, tela 15.6" Full HD.',
    categoryId: 'cat-3', price: 2899.00, commissionPercent: 5, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'TEC-001', stock: 35, checkoutUrl: 'https://checkout.digitaisbr.com/prod-7', createdAt: '2025-06-10', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-8', name: 'Smartphone Samsung Galaxy A54', description: '128GB, câmera tripla 50MP, tela AMOLED 6.4".',
    categoryId: 'cat-3', price: 1599.00, commissionPercent: 6, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'TEC-002', stock: 80, checkoutUrl: 'https://checkout.digitaisbr.com/prod-8', createdAt: '2025-06-08', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-9', name: 'Smart TV 50" 4K LG', description: 'Smart TV 50 polegadas 4K com webOS e controle por voz.',
    categoryId: 'cat-3', price: 2199.00, commissionPercent: 4, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'TEC-003', stock: 20, checkoutUrl: 'https://checkout.digitaisbr.com/prod-9', createdAt: '2025-06-12', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-10', name: 'Kit Ferramentas Profissional', description: 'Maleta com 150 peças para uso doméstico e profissional.',
    categoryId: 'cat-4', price: 289.90, commissionPercent: 10, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'CAS-001', stock: 100, checkoutUrl: 'https://checkout.digitaisbr.com/prod-10', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-11', name: 'Purificador de Água IBBL', description: 'Purificador com 3 estágios de filtragem e água gelada.',
    categoryId: 'cat-4', price: 599.90, commissionPercent: 8, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'CAS-002', stock: 40, checkoutUrl: 'https://checkout.digitaisbr.com/prod-11', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-12', name: 'Aspirador Robô Inteligente', description: 'Aspirador robô com mapeamento a laser e controle por app.',
    categoryId: 'cat-4', price: 1299.00, commissionPercent: 7, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'CAS-003', stock: 15, checkoutUrl: 'https://checkout.digitaisbr.com/prod-12', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-13', name: 'Camiseta Polo Premium', description: 'Algodão pima, disponível em 8 cores. Tam. P ao GG.',
    categoryId: 'cat-5', price: 119.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'MOD-001', stock: 200, checkoutUrl: 'https://checkout.digitaisbr.com/prod-13', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-14', name: 'Tênis Running Pro', description: 'Amortecimento Gel, ideal para corridas longas.',
    categoryId: 'cat-5', price: 349.90, commissionPercent: 14, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'MOD-002', stock: 60, checkoutUrl: 'https://checkout.digitaisbr.com/prod-14', createdAt: '2025-06-07', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-15', name: 'Relógio Smartwatch FitBand', description: 'Monitor cardíaco, GPS, resistente à água.',
    categoryId: 'cat-5', price: 499.90, commissionPercent: 12, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'MOD-003', stock: 45, checkoutUrl: 'https://checkout.digitaisbr.com/prod-15', createdAt: '2025-06-10', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-16', name: 'Cesta Orgânica Semanal', description: 'Frutas, legumes e verduras orgânicas entregues semanalmente.',
    categoryId: 'cat-6', price: 89.90, commissionPercent: 10, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'ALI-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-16', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-17', name: 'Kit Whey Protein + Creatina', description: 'Whey Protein 900g + Creatina 300g para performance.',
    categoryId: 'cat-6', price: 159.90, commissionPercent: 16, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'ALI-002', stock: 120, checkoutUrl: 'https://checkout.digitaisbr.com/prod-17', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-18', name: 'Café Especial Gourmet 1kg', description: 'Grãos selecionados, torra média, notas de chocolate.',
    categoryId: 'cat-6', price: 69.90, commissionPercent: 22, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'ALI-003', stock: 200, checkoutUrl: 'https://checkout.digitaisbr.com/prod-18', createdAt: '2025-06-08', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-19', name: 'Hospedagem Cloud VPS', description: 'Servidor VPS com 4GB RAM, 80GB SSD e suporte 24/7.',
    categoryId: 'cat-7', price: 79.90, commissionPercent: 25, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'DIG-001', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-19', createdAt: '2025-06-01', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-20', name: 'Plataforma E-commerce SaaS', description: 'Loja virtual completa com gateway de pagamento integrado.',
    categoryId: 'cat-7', price: 199.90, commissionPercent: 20, image: '', status: 'ativo', exclusivity: 'intermediario',
    sku: 'DIG-002', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-20', createdAt: '2025-06-03', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-21', name: 'Consultoria SEO Mensal', description: 'Análise e otimização mensal de SEO para seu site.',
    categoryId: 'cat-7', price: 499.90, commissionPercent: 18, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'DIG-003', stock: 10, checkoutUrl: 'https://checkout.digitaisbr.com/prod-21', createdAt: '2025-06-05', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-22', name: 'Plano Odontológico Familiar', description: 'Cobertura para até 4 dependentes com ortodontia.',
    categoryId: 'cat-1', price: 149.90, commissionPercent: 18, image: '', status: 'inativo', exclusivity: 'intermediario',
    sku: 'SAU-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-22', createdAt: '2025-05-20', updatedAt: '2025-06-15',
  },
  {
    id: 'prod-23', name: 'Mochila Executiva Antifurto', description: 'Compartimento para notebook 15", USB integrada.',
    categoryId: 'cat-5', price: 199.90, commissionPercent: 15, image: '', status: 'esgotado', exclusivity: 'todos',
    sku: 'MOD-004', stock: 0, checkoutUrl: 'https://checkout.digitaisbr.com/prod-23', createdAt: '2025-06-01', updatedAt: '2025-06-18',
  },
  {
    id: 'prod-24', name: 'Curso Inglês Online 12 meses', description: 'Acesso completo com aulas ao vivo e certificado.',
    categoryId: 'cat-2', price: 497.00, commissionPercent: 22, image: '', status: 'ativo', exclusivity: 'todos',
    sku: 'EDU-004', stock: -1, checkoutUrl: 'https://checkout.digitaisbr.com/prod-24', createdAt: '2025-06-10', updatedAt: '2025-06-20',
  },
  {
    id: 'prod-25', name: 'Kit Smart Home Alexa', description: 'Echo Dot + 2 lâmpadas smart + tomada inteligente.',
    categoryId: 'cat-3', price: 699.90, commissionPercent: 8, image: '', status: 'ativo', exclusivity: 'avancado',
    sku: 'TEC-004', stock: 25, checkoutUrl: 'https://checkout.digitaisbr.com/prod-25', createdAt: '2025-06-14', updatedAt: '2025-06-20',
  },
];
