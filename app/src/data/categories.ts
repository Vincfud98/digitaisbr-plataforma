import type { ProductCategory } from '../types';

export const categories: ProductCategory[] = [
  { id: 'cat-1', name: 'Saúde & Bem-estar', slug: 'saude', icon: 'HeartOutlined', color: '#f5222d' },
  { id: 'cat-2', name: 'Seguros', slug: 'seguros', icon: 'SafetyOutlined', color: '#fa8c16' },
  { id: 'cat-3', name: 'Serviços Financeiros', slug: 'financeiro', icon: 'BankOutlined', color: '#52c41a' },
  { id: 'cat-4', name: 'Ferramentas Digitais', slug: 'ferramentas', icon: 'ToolOutlined', color: '#1677ff' },
  { id: 'cat-5', name: 'Assinaturas & Streaming', slug: 'assinaturas', icon: 'PlayCircleOutlined', color: '#722ed1' },
  { id: 'cat-6', name: 'Viagem & Lazer', slug: 'viagem', icon: 'GlobalOutlined', color: '#13c2c2' },
  { id: 'cat-7', name: 'Conectividade', slug: 'conectividade', icon: 'WifiOutlined', color: '#eb2f96' },
];
