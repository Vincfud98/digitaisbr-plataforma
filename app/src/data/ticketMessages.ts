import type { TicketMessage } from '../types';

const conversations: Record<string, { sender: 'user' | 'agent' | 'system'; name: string; content: string }[]> = {
  'SUP-001': [
    { sender: 'user', name: 'Maria Silva', content: 'Olá, estou tentando acessar minha loja mas aparece erro 403. Já tentei limpar o cache do navegador.' },
    { sender: 'agent', name: 'Carlos Atendimento', content: 'Olá Maria! Vou verificar o status da sua loja agora. Pode me informar qual navegador está usando?' },
    { sender: 'user', name: 'Maria Silva', content: 'Estou usando o Chrome, versão mais recente.' },
    { sender: 'agent', name: 'Carlos Atendimento', content: 'Encontrei o problema. Sua loja estava com uma configuração de permissão incorreta. Já corrigi aqui. Pode tentar acessar novamente?' },
    { sender: 'user', name: 'Maria Silva', content: 'Agora funcionou! Muito obrigada pela rapidez!' },
    { sender: 'agent', name: 'Carlos Atendimento', content: 'Fico feliz que deu certo! Qualquer outra dúvida, estamos à disposição.' },
    { sender: 'system', name: 'Sistema', content: 'Ticket fechado por Carlos Atendimento.' },
    { sender: 'user', name: 'Maria Silva', content: 'Obrigada, resolvido!' },
  ],
  'SUP-002': [
    { sender: 'user', name: 'João Santos', content: 'Boa tarde, fiz uma venda no dia 18/05 mas a comissão ainda não apareceu no meu painel. O pedido já foi aprovado.' },
    { sender: 'agent', name: 'Suporte DigitaisBR', content: 'Olá João! Vou verificar essa venda. Pode me passar o número do pedido?' },
    { sender: 'user', name: 'João Santos', content: 'Claro, é o pedido VND-042.' },
    { sender: 'agent', name: 'Suporte DigitaisBR', content: 'Encontrei! A venda foi aprovada mas a comissão ficou em processamento por conta de uma validação manual. Vou aprovar agora.' },
    { sender: 'system', name: 'Sistema', content: 'Comissão COM-042 aprovada manualmente.' },
    { sender: 'user', name: 'João Santos', content: 'Perfeito, já apareceu aqui! Valeu!' },
    { sender: 'agent', name: 'Suporte DigitaisBR', content: 'Disponha! Lembrando que comissões acima de R$500 passam por aprovação manual. Qualquer dúvida, estamos aqui.' },
  ],
  'SUP-003': [
    { sender: 'user', name: 'Carlos Mendes', content: 'Tentei trocar a cor primária da minha loja mas quando salvo não aplica a mudança.' },
    { sender: 'agent', name: 'Equipe Técnica', content: 'Olá Carlos! Esse é um bug conhecido que estamos corrigindo. Por enquanto, tente usar cores no formato hexadecimal (#FF5500).' },
    { sender: 'user', name: 'Carlos Mendes', content: 'Ah, eu estava usando rgb(). Mudei pra hex e funcionou. Obrigado!' },
  ],
  'SUP-004': [
    { sender: 'user', name: 'Ana Oliveira', content: 'Olá, o produto "Kit Premium" aparece como esgotado na minha loja mas eu sei que tem estoque.' },
    { sender: 'agent', name: 'Suporte DigitaisBR', content: 'Oi Ana! Vou verificar o catálogo. Um momento por favor.' },
    { sender: 'user', name: 'Ana Oliveira', content: 'Ok, aguardo.' },
  ],
  'SUP-005': [
    { sender: 'user', name: 'Juliana Costa', content: 'Quero fazer upgrade do plano Intermediário para o Avançado. Como funciona a cobrança proporcional?' },
    { sender: 'agent', name: 'Ana Suporte', content: 'Olá Juliana! O upgrade é imediato e a cobrança é proporcional aos dias restantes do ciclo atual.' },
    { sender: 'user', name: 'Juliana Costa', content: 'Entendi. E os benefícios novos ativam na hora?' },
    { sender: 'agent', name: 'Ana Suporte', content: 'Sim! Assim que o upgrade for confirmado, todos os benefícios do plano Avançado ficam disponíveis imediatamente.' },
    { sender: 'user', name: 'Juliana Costa', content: 'Ótimo, vou fazer o upgrade então. Obrigada!' },
    { sender: 'agent', name: 'Ana Suporte', content: 'Perfeito! Qualquer dúvida durante o processo, me chame aqui.' },
    { sender: 'system', name: 'Sistema', content: 'Ticket fechado por Ana Suporte.' },
  ],
  'SUP-006': [
    { sender: 'user', name: 'Pedro Lima', content: 'O link de checkout dos meus produtos não está funcionando. Os clientes reclamaram que dá página não encontrada.' },
    { sender: 'agent', name: 'Suporte DigitaisBR', content: 'Oi Pedro! Vou verificar os links de checkout da sua loja agora mesmo.' },
    { sender: 'user', name: 'Pedro Lima', content: 'Obrigado, é urgente pois estou perdendo vendas.' },
  ],
};

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

export const ticketMessages: TicketMessage[] = [];

Object.entries(conversations).forEach(([ticketId, msgs]) => {
  const baseDate = new Date(2025, 4, 15);
  const ticketNum = parseInt(ticketId.split('-')[1]);
  const dayOffset = Math.floor(seededRandom(ticketNum * 3) * 45);
  baseDate.setDate(baseDate.getDate() + dayOffset);

  msgs.forEach((msg, i) => {
    const msgDate = new Date(baseDate.getTime() + i * 3600000 * (1 + seededRandom(ticketNum * 100 + i) * 4));
    ticketMessages.push({
      id: `MSG-${ticketId}-${i + 1}`,
      ticketId,
      sender: msg.sender,
      senderName: msg.name,
      content: msg.content,
      createdAt: msgDate.toISOString(),
    });
  });
});

for (let i = 7; i <= 20; i++) {
  const ticketId = `SUP-${String(i).padStart(3, '0')}`;
  const baseDate = new Date(2025, 4, 15);
  const dayOffset = Math.floor(seededRandom(i * 3) * 45);
  baseDate.setDate(baseDate.getDate() + dayOffset);

  const userNames = ['Fernanda Souza', 'Ricardo Alves', 'Maria Silva', 'João Santos', 'Carlos Mendes', 'Ana Oliveira', 'Juliana Costa', 'Pedro Lima'];
  const userName = userNames[(i - 1) % userNames.length];

  const subjects = [
    'Não recebi o e-mail de confirmação', 'Como solicitar saque de comissões?', 'Banner da loja não carrega',
    'Benefício expirou antes do prazo', 'Erro 500 ao abrir relatórios', 'Quero cancelar meu plano',
    'Venda aprovada mas comissão pendente', 'Sugestão de novo produto no catálogo', 'Problema com notificações por email',
    'Como funciona o cashback?', 'Minha loja sumiu do destaque', 'Preciso de nota fiscal',
    'Atualização de dados cadastrais', 'Parceiro não responde agendamento',
  ];
  const subject = subjects[(i - 7) % subjects.length];

  ticketMessages.push({
    id: `MSG-${ticketId}-1`,
    ticketId,
    sender: 'user',
    senderName: userName,
    content: `Olá, gostaria de ajuda com o seguinte: ${subject.toLowerCase()}.`,
    createdAt: baseDate.toISOString(),
  });

  const msgCount = Math.floor(seededRandom(i * 17) * 8) + 1;
  const agents = ['Suporte DigitaisBR', 'Ana Suporte', 'Carlos Atendimento', 'Equipe Técnica'];

  for (let j = 1; j < msgCount; j++) {
    const isAgent = j % 2 === 1;
    const msgDate = new Date(baseDate.getTime() + j * 3600000 * 2);
    ticketMessages.push({
      id: `MSG-${ticketId}-${j + 1}`,
      ticketId,
      sender: isAgent ? 'agent' : 'user',
      senderName: isAgent ? agents[Math.floor(seededRandom(i * 13 + j) * 4)] : userName,
      content: isAgent
        ? ['Estou verificando isso para você. Um momento.', 'Entendi a situação. Vou encaminhar para o setor responsável.', 'Pode me dar mais detalhes sobre o problema?', 'Pronto, a correção foi aplicada. Pode verificar?'][Math.floor(seededRandom(i * 50 + j) * 4)]
        : ['Obrigado, aguardo retorno.', 'Sim, o problema continua.', 'Perfeito, vou testar.', 'Funcionou, muito obrigado!'][Math.floor(seededRandom(i * 60 + j) * 4)],
      createdAt: msgDate.toISOString(),
    });
  }
}
