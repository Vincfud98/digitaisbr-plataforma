import type { ProductCategory } from '../types';

export const categories: ProductCategory[] = [
  { id: 'cat-1', name: 'Saúde & Bem-estar', slug: 'saude', icon: 'HeartOutlined', color: '#f5222d' },
  { id: 'cat-2', name: 'Educação', slug: 'educacao', icon: 'ReadOutlined', color: '#1677ff' },
  { id: 'cat-3', name: 'Tecnologia', slug: 'tecnologia', icon: 'LaptopOutlined', color: '#722ed1' },
  { id: 'cat-4', name: 'Casa & Jardim', slug: 'casa-jardim', icon: 'HomeOutlined', color: '#52c41a' },
  { id: 'cat-5', name: 'Moda & Acessórios', slug: 'moda', icon: 'SkinOutlined', color: '#eb2f96' },
  { id: 'cat-6', name: 'Alimentação', slug: 'alimentacao', icon: 'CoffeeOutlined', color: '#fa8c16' },
  { id: 'cat-7', name: 'Serviços Digitais', slug: 'servicos-digitais', icon: 'CloudOutlined', color: '#13c2c2' },
];
