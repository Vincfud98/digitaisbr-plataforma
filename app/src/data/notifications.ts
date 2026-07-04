import type { Notification, NotificationType, NotificationChannel } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const templates: { type: NotificationType; title: string; message: string }[] = [
  { type: 'venda', title: 'Nova venda realizada!', message: 'Você realizou uma venda de R$ 149,90 na sua loja.' },
  { type: 'comissao', title: 'Comissão creditada', message: 'Comissão de R$ 22,49 foi creditada na sua conta.' },
  { type: 'sistema', title: 'Atualização da plataforma', message: 'Novos recursos disponíveis! Confira as novidades.' },
  { type: 'beneficio', title: 'Novo benefício disponível', message: 'Desconto de 20% em cursos de marketing digital.' },
  { type: 'conteudo', title: 'Novo conteúdo publicado', message: 'Artigo: Como aumentar suas vendas online em 2025.' },
  { type: 'suporte', title: 'Ticket respondido', message: 'Sua solicitação #SUP-042 foi respondida pela equipe.' },
  { type: 'venda', title: 'Venda aprovada', message: 'A venda #VND-018 foi aprovada e a comissão será gerada.' },
  { type: 'sistema', title: 'Manutenção programada', message: 'Manutenção dia 28/06 das 02h às 04h. Sem impacto.' },
  { type: 'comissao', title: 'Pagamento processado', message: 'Saque de R$ 350,00 processado. Previsão: 2 dias úteis.' },
  { type: 'beneficio', title: 'Benefício expirando', message: 'Seu desconto de 15% na TechShop expira em 5 dias.' },
  { type: 'conteudo', title: 'Curso disponível', message: 'Masterclass de fotografia de produtos já está no ar!' },
  { type: 'suporte', title: 'Ticket resolvido', message: 'Seu ticket #SUP-035 foi marcado como resolvido.' },
  { type: 'venda', title: 'Venda cancelada', message: 'A venda #VND-045 foi cancelada pelo cliente.' },
  { type: 'sistema', title: 'Novo parceiro na plataforma', message: 'EduTech Brasil agora oferece cursos com 30% off.' },
  { type: 'comissao', title: 'Meta de comissão atingida!', message: 'Parabéns! Você atingiu R$ 1.000 em comissões este mês.' },
  { type: 'beneficio', title: 'Cashback disponível', message: 'Você tem R$ 45,00 em cashback para utilizar.' },
  { type: 'sistema', title: 'Bem-vindo à DigitaisBR!', message: 'Sua conta foi criada. Explore os benefícios do seu plano.' },
  { type: 'venda', title: 'Produto em destaque vendeu!', message: 'O Kit Premium Saúde vendeu 3 unidades hoje.' },
  { type: 'suporte', title: 'Avalie o atendimento', message: 'Como foi a resolução do ticket #SUP-028? Avalie!' },
  { type: 'conteudo', title: 'E-book gratuito', message: 'Baixe o Guia Completo de SEO para Lojas Virtuais.' },
  { type: 'sistema', title: 'Promoção de upgrade', message: 'Upgrade para Avançado com 20% off até sexta!' },
  { type: 'venda', title: 'Recorde de vendas!', message: 'Sua loja bateu recorde: 12 vendas esta semana!' },
  { type: 'comissao', title: 'Comissão pendente', message: 'Você tem R$ 89,50 em comissões pendentes de aprovação.' },
  { type: 'beneficio', title: 'Parceiro em destaque', message: 'Clínica Sorriso: consulta gratuita para plano Avançado.' },
  { type: 'suporte', title: 'FAQ atualizado', message: 'Novas perguntas frequentes sobre comissões e saques.' },
];

const channels: NotificationChannel[] = ['in-app', 'email', 'push'];

export const notifications: Notification[] = templates.map((t, i) => {
  const seed = i + 1;
  const dayOffset = Math.floor(seededRandom(seed * 3) * 30);
  const date = new Date(2025, 5, 1);
  date.setDate(date.getDate() + dayOffset);

  return {
    id: `notif-${String(i + 1).padStart(3, '0')}`,
    type: t.type,
    title: t.title,
    message: t.message,
    channel: channels[Math.floor(seededRandom(seed * 7) * 3)],
    userId: `assoc-${String(Math.floor(seededRandom(seed * 11) * 10) + 1).padStart(3, '0')}`,
    read: seededRandom(seed * 13) > 0.4,
    actionUrl: seededRandom(seed * 17) > 0.5 ? '/vendas' : null,
    createdAt: date.toISOString(),
  };
});
