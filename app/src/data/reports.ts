import type { ReportConfig } from '../types';

export const reportConfigs: ReportConfig[] = [
  { id: 'rep-001', name: 'Vendas por Período', description: 'Relatório detalhado de vendas com filtro por data', type: 'vendas', period: 'mensal', format: 'tabela', lastGenerated: '2025-06-20T10:00:00Z', favorite: true },
  { id: 'rep-002', name: 'Comissões Pendentes', description: 'Lista de comissões aguardando aprovação ou pagamento', type: 'comissoes', period: 'semanal', format: 'tabela', lastGenerated: '2025-06-22T14:30:00Z', favorite: true },
  { id: 'rep-003', name: 'Crescimento de Associados', description: 'Evolução do número de associados por plano', type: 'associados', period: 'mensal', format: 'grafico', lastGenerated: '2025-06-18T09:00:00Z', favorite: false },
  { id: 'rep-004', name: 'Balanço Financeiro', description: 'Entradas, saídas e saldo por período', type: 'financeiro', period: 'mensal', format: 'resumo', lastGenerated: '2025-06-21T16:00:00Z', favorite: true },
  { id: 'rep-005', name: 'Produtos Mais Vendidos', description: 'Ranking de produtos por volume de vendas', type: 'produtos', period: 'mensal', format: 'tabela', lastGenerated: '2025-06-19T11:00:00Z', favorite: false },
  { id: 'rep-006', name: 'Performance das Lojas', description: 'Visualizações, vendas e conversão por loja', type: 'lojas', period: 'semanal', format: 'tabela', lastGenerated: '2025-06-22T08:00:00Z', favorite: false },
  { id: 'rep-007', name: 'Receita por Categoria', description: 'Distribuição de receita por categoria de produto', type: 'vendas', period: 'mensal', format: 'grafico', lastGenerated: null, favorite: false },
  { id: 'rep-008', name: 'Top Associados por Comissão', description: 'Ranking dos associados com maior comissão acumulada', type: 'comissoes', period: 'mensal', format: 'tabela', lastGenerated: '2025-06-15T10:00:00Z', favorite: true },
  { id: 'rep-009', name: 'Churn de Associados', description: 'Taxa de cancelamento e motivos por período', type: 'associados', period: 'trimestral', format: 'grafico', lastGenerated: null, favorite: false },
  { id: 'rep-010', name: 'Fluxo de Caixa', description: 'Projeção de fluxo de caixa para os próximos meses', type: 'financeiro', period: 'trimestral', format: 'grafico', lastGenerated: '2025-06-10T14:00:00Z', favorite: false },
  { id: 'rep-011', name: 'Estoque Crítico', description: 'Produtos com estoque abaixo do mínimo', type: 'produtos', period: 'diario', format: 'tabela', lastGenerated: '2025-06-23T07:00:00Z', favorite: false },
  { id: 'rep-012', name: 'Conversão por Loja', description: 'Taxa de conversão (cliques vs vendas) por loja', type: 'lojas', period: 'semanal', format: 'resumo', lastGenerated: '2025-06-20T15:00:00Z', favorite: false },
];
