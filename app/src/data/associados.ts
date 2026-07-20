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

const niches = [
  'Lifestyle', 'Fitness', 'Beleza', 'Tech', 'Gastronomia',
  'Moda', 'Viagens', 'Educação', 'Finanças', 'Humor',
  'Games', 'Música', 'Saúde', 'Maternidade', 'Pets',
  'DIY & Decor', 'Esportes', 'Empreendedorismo', 'Sustentabilidade', 'Fotografia',
  'Lifestyle', 'Fitness', 'Beleza', 'Tech', 'Gastronomia',
  'Moda', 'Viagens', 'Educação', 'Finanças', 'Humor',
];

const bios = [
  'Criadora de conteúdo lifestyle. Compartilho dicas de organização e bem-estar.',
  'Personal trainer e criador de conteúdo fitness. Transformando vidas!',
  'Maquiadora profissional e beauty influencer. Tutoriais e reviews.',
  'Tech reviewer e early adopter. Tudo sobre gadgets e tecnologia.',
  'Chef e food blogger. Receitas fáceis e deliciosas para o dia a dia.',
  'Fashion influencer e consultora de imagem. Tendências e looks acessíveis.',
  'Travel creator. Já visitei 28 países e conto tudo aqui!',
  'Professor e criador de conteúdo educacional. Simplificando o complexo.',
  'Educador financeiro. Investimentos, economia e liberdade financeira.',
  'Humorista digital. Conteúdo leve para alegrar seu dia!',
  'Gamer e streamer. Reviews, gameplays e dicas.',
  'Músico e produtor. Covers, originais e dicas de produção.',
  'Nutricionista e influencer de saúde. Alimentação saudável na prática.',
  'Mãe real e criadora de conteúdo. Maternidade sem filtro.',
  'Apaixonada por pets. Dicas de cuidados e conteúdo fofo!',
  'DIY, decoração e organização de ambientes com criatividade.',
  'Atleta e influencer de esportes. Treinos, competições e motivação.',
  'Empreendedor serial. Negócios, startups e produtividade.',
  'Ativista ambiental e criadora de conteúdo sustentável.',
  'Fotógrafo profissional. Dicas, presets e bastidores.',
  'Compartilho minha rotina e dicas do dia a dia.',
  'Treinos funcionais e nutrição esportiva.',
  'Skincare, cabelos e autoestima.',
  'Unboxings e análises de tecnologia.',
  'Receitas rápidas e saudáveis.',
  'Moda sustentável e slow fashion.',
  'Roteiros de viagem com orçamento real.',
  'Didática e conteúdo para concursos.',
  'Cripto, renda fixa e variável para iniciantes.',
  'Esquetes, memes e paródias.',
];

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
    niche: niches[i],
    bio: bios[i],
    instagram: `@${slug}`,
    youtube: i % 3 === 0 ? name.split(' ')[0] + ' Channel' : '',
    tiktok: i % 2 === 0 ? `@${slug}` : '',
    followers: Math.floor(seededRandom(i + 400) * 980000) + 1000,
    engagementRate: Math.round((seededRandom(i + 500) * 8 + 1.5) * 10) / 10,
  };
});
