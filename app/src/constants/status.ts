export const associadoStatusConfig: Record<string, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  suspenso: { color: 'warning', label: 'Suspenso' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

export const ticketStatusConfig: Record<string, { color: string; label: string }> = {
  aberto: { color: 'red', label: 'Aberto' },
  em_andamento: { color: 'blue', label: 'Em Andamento' },
  resolvido: { color: 'green', label: 'Resolvido' },
  fechado: { color: 'default', label: 'Fechado' },
};

export const saleStatusConfig: Record<string, { color: string; label: string }> = {
  pendente: { color: 'warning', label: 'Pendente' },
  confirmada: { color: 'blue', label: 'Confirmada' },
  entregue: { color: 'green', label: 'Entregue' },
  cancelada: { color: 'red', label: 'Cancelada' },
};

export const productStatusConfig: Record<string, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  esgotado: { color: 'red', label: 'Esgotado' },
};
