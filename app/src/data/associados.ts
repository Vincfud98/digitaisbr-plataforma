import type { Associado } from '../types';

const states = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'SC'];
const cities: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'],
  BA: ['Salvador', 'Feira de Santana'],
  RS: ['Porto Alegre', 'Caxias do Sul'],
  PR: ['Curitiba', 'Londrina', 'Maringá'],
  PE: ['Recife', 'Olinda'],
  CE: ['Fortaleza', 'Juazeiro do Norte'],
  PA: ['Belém', 'Ananindeua'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau'],
};

const names = [
  'Ana Silva', 'Bruno Costa', 'Carla Oliveira', 'Diego Santos', 'Elena Ferreira',
  'Felipe Almeida', 'Gabriela Lima', 'Hugo Pereira', 'Isabela Souza', 'João Rodrigues',
  'Karen Nascimento', 'Lucas Carvalho', 'Mariana Ribeiro', 'Nicolas Gomes', 'Olívia Martins',
  'Paulo Araújo', 'Rafaela Barbosa', 'Samuel Rocha', 'Tatiane Lopes', 'Vinícius Mendes',
  'Wanda Correia', 'Xavier Teixeira', 'Yasmin Moreira', 'Zélia Cardoso', 'André Machado',
  'Bianca Pinto', 'César Moura', 'Daniela Nunes', 'Eduardo Vieira', 'Fernanda Dias',
];

const planTypes = ['basico', 'intermediario', 'avancado'] as const;
const planIds = ['plan-basico', 'plan-intermediario', 'plan-avancado'];
const statuses = ['ativo', 'ativo', 'ativo', 'ativo', 'inativo', 'suspenso'] as const;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateCpf(seed: number): string {
  const digits = Array.from({ length: 11 }, (_, i) => Math.floor(seededRandom(seed + i) * 10));
  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${digits.slice(9).join('')}`;
}

export const mockAssociados: Associado[] = names.map((name, i) => {
  const state = states[i % states.length];
  const citiesForState = cities[state];
  const city = citiesForState[i % citiesForState.length];
  const planIndex = i % 3;
  const statusIndex = i % statuses.length;
  const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const daysAgo = Math.floor(seededRandom(i + 100) * 365);
  const date = new Date(2025, 0, 1);
  date.setDate(date.getDate() + daysAgo);

  return {
    id: `assoc-${i + 1}`,
    name,
    email: `${slug}@email.com`,
    cpfCnpj: generateCpf(i),
    phone: `(${11 + (i % 80)}) 9${String(Math.floor(seededRandom(i + 50) * 90000000 + 10000000))}`,
    address: `Rua ${['das Flores', 'Brasil', 'da Paz', 'São Paulo', 'Boa Vista', 'Principal'][i % 6]}, ${100 + i * 13}`,
    city,
    state,
    planId: planIds[planIndex],
    planType: planTypes[planIndex],
    status: statuses[statusIndex],
    storeSlug: slug,
    storeName: `Loja ${name.split(' ')[0]}`,
    createdAt: date.toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    totalSales: Math.floor(seededRandom(i + 200) * 500),
    totalCommission: Math.floor(seededRandom(i + 300) * 5000 * 100) / 100,
  };
});
