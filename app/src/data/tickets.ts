import type { SupportTicket, TicketStatus, TicketPriority, PlanType } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const ticketItems: { subject: string; category: string }[] = [
  { subject: 'Não consigo acessar minha loja', category: 'Acesso' },
  { subject: 'Comissão não foi creditada', category: 'Financeiro' },
  { subject: 'Erro ao personalizar cores da loja', category: 'Loja Virtual' },
  { subject: 'Produto aparece esgotado incorretamente', category: 'Catálogo' },
  { subject: 'Dúvida sobre upgrade de plano', category: 'Planos' },
  { subject: 'Link de checkout não funciona', category: 'Vendas' },
  { subject: 'Não recebi o e-mail de confirmação', category: 'Acesso' },
  { subject: 'Como solicitar saque de comissões?', category: 'Financeiro' },
  { subject: 'Banner da loja não carrega', category: 'Loja Virtual' },
  { subject: 'Benefício expirou antes do prazo', category: 'Benefícios' },
  { subject: 'Erro 500 ao abrir relatórios', category: 'Sistema' },
  { subject: 'Quero cancelar meu plano', category: 'Planos' },
  { subject: 'Venda aprovada mas comissão pendente', category: 'Financeiro' },
  { subject: 'Sugestão de novo produto no catálogo', category: 'Catálogo' },
  { subject: 'Problema com notificações por email', category: 'Sistema' },
  { subject: 'Como funciona o cashback?', category: 'Benefícios' },
  { subject: 'Minha loja sumiu do destaque', category: 'Loja Virtual' },
  { subject: 'Preciso de nota fiscal', category: 'Financeiro' },
  { subject: 'Atualização de dados cadastrais', category: 'Acesso' },
  { subject: 'Parceiro não responde agendamento', category: 'Serviços' },
];

const users = [
  { id: 'assoc-001', name: 'Maria Silva', plan: 'basico' as PlanType },
  { id: 'assoc-002', name: 'João Santos', plan: 'intermediario' as PlanType },
  { id: 'assoc-003', name: 'Carlos Mendes', plan: 'avancado' as PlanType },
  { id: 'assoc-004', name: 'Ana Oliveira', plan: 'basico' as PlanType },
  { id: 'assoc-005', name: 'Juliana Costa', plan: 'intermediario' as PlanType },
  { id: 'assoc-006', name: 'Pedro Lima', plan: 'avancado' as PlanType },
  { id: 'assoc-007', name: 'Fernanda Souza', plan: 'intermediario' as PlanType },
  { id: 'assoc-008', name: 'Ricardo Alves', plan: 'avancado' as PlanType },
];

const statuses: TicketStatus[] = ['aberto', 'em-andamento', 'resolvido', 'fechado'];
const priorities: TicketPriority[] = ['baixa', 'media', 'alta', 'urgente'];
const agents = ['Suporte DigitaisBR', 'Ana Suporte', 'Carlos Atendimento', 'Equipe Técnica'];

export const supportTickets: SupportTicket[] = ticketItems.map((t, i) => {
  const seed = i + 1;
  const dayOffset = Math.floor(seededRandom(seed * 3) * 45);
  const date = new Date(2025, 4, 15);
  date.setDate(date.getDate() + dayOffset);
  const user = users[i % users.length];
  const statusIdx = Math.floor(seededRandom(seed * 7) * 4);
  const status = statuses[statusIdx];
  const priorityIdx = Math.floor(seededRandom(seed * 11) * 4);

  return {
    id: `SUP-${String(i + 1).padStart(3, '0')}`,
    subject: t.subject,
    description: `Descrição detalhada: ${t.subject}`,
    category: t.category,
    priority: priorities[priorityIdx],
    status,
    userId: user.id,
    userName: user.name,
    userPlan: user.plan,
    assignedTo: status !== 'aberto' ? agents[Math.floor(seededRandom(seed * 13) * 4)] : null,
    messages: Math.floor(seededRandom(seed * 17) * 8) + 1,
    rating: status === 'resolvido' || status === 'fechado' ? Math.floor(seededRandom(seed * 19) * 3) + 3 : null,
    createdAt: date.toISOString(),
    updatedAt: new Date(date.getTime() + 86400000 * Math.floor(seededRandom(seed * 23) * 5)).toISOString(),
    resolvedAt: status === 'resolvido' || status === 'fechado' ? new Date(date.getTime() + 86400000 * Math.floor(seededRandom(seed * 29) * 7 + 1)).toISOString() : null,
  };
});
