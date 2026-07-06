import { useState, useMemo } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Select, Divider, Progress, Segmented, Descriptions } from 'antd';
import {
  BankOutlined, ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
  WalletOutlined, ClockCircleOutlined, CalendarOutlined, RiseOutlined,
  FallOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useAppSelector } from '../../store';
import type { FinancialTransaction, TransactionType } from '../../types';

const { Title, Text } = Typography;
const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FinanceiroPage() {
  const transactions = useAppSelector((s) => s.financeiro.list);
  const associados = useAppSelector((s) => s.associados.list);
  const plans = useAppSelector((s) => s.planos.list);
  const commissions = useAppSelector((s) => s.comissoes.list);
  const [tab, setTab] = useState<string>('fluxo');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => [...new Set(transactions.map((t) => t.category))], [transactions]);

  const totalEntrada = transactions.filter((t) => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
  const totalSaida = transactions.filter((t) => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
  const saldo = totalEntrada - totalSaida;

  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));
  const assocAtivos = associados.filter((a) => a.status === 'ativo');
  const mrr = assocAtivos.reduce((s, a) => s + (planMap[a.planId]?.price ?? 0), 0);

  const comissoesPendentes = commissions.filter((c) => c.status === 'aprovada');
  const totalComissoesPendentes = comissoesPendentes.reduce((s, c) => s + c.commissionValue, 0);
  const comissoesPagas = commissions.filter((c) => c.status === 'paga');
  const totalComissoesPagas = comissoesPagas.reduce((s, c) => s + c.commissionValue, 0);

  const cashFlowData = useMemo(() => {
    const months: Record<string, { entrada: number; saida: number }> = {};
    transactions.forEach((t) => {
      const m = t.createdAt.slice(0, 7);
      if (!months[m]) months[m] = { entrada: 0, saida: 0 };
      months[m][t.type] += t.amount;
    });
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => {
        const [y, m] = k.split('-');
        return { mes: `${monthNames[parseInt(m) - 1]}/${y.slice(2)}`, entradas: v.entrada, saidas: v.saida, resultado: v.entrada - v.saida };
      });
  }, [transactions]);

  const receitaBruta = totalEntrada;
  const custoComissoes = transactions.filter((t) => t.type === 'saida' && t.category === 'Comissão').reduce((s, t) => s + t.amount, 0);
  const custosOperacionais = transactions.filter((t) => t.type === 'saida' && t.category !== 'Comissão').reduce((s, t) => s + t.amount, 0);
  const lucroLiquido = receitaBruta - custoComissoes - custosOperacionais;
  const margem = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

  const dreItems = [
    { label: 'Receita Bruta (vendas)', value: receitaBruta, color: '#52c41a' },
    { label: '(-) Comissões pagas', value: -custoComissoes, color: '#ff4d4f' },
    { label: '(-) Custos operacionais', value: -custosOperacionais, color: '#ff7a45' },
    { label: '= Lucro Líquido', value: lucroLiquido, color: lucroLiquido >= 0 ? '#52c41a' : '#ff4d4f', bold: true },
  ];

  const custoBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter((t) => t.type === 'saida').forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, val]) => ({
      categoria: cat,
      valor: val,
      percent: totalSaida > 0 ? (val / totalSaida) * 100 : 0,
    }));
  }, [transactions, totalSaida]);

  const mrrProjection = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date(2025, 6, 1);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const growth = 1 + i * 0.05;
      return {
        mes: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
        recorrente: Math.round(mrr * growth * 100) / 100,
        vendas: Math.round((totalEntrada / 3) * (1 + i * 0.03) * 100) / 100,
      };
    });
  }, [mrr, totalEntrada]);

  const contasReceber = useMemo(() =>
    assocAtivos.map((a) => ({
      key: a.id,
      nome: a.name,
      plano: planMap[a.planId]?.name ?? '-',
      valor: planMap[a.planId]?.price ?? 0,
      vencimento: '10/07/2025',
      status: 'A vencer',
    })).slice(0, 10),
  [assocAtivos, planMap]);

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const txColumns = [
    {
      title: 'Data', dataIndex: 'createdAt', key: 'date', width: 110,
      sorter: (a: FinancialTransaction, b: FinancialTransaction) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend' as const,
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Tipo', dataIndex: 'type', key: 'type', width: 100,
      render: (v: TransactionType) => (
        <Tag color={v === 'entrada' ? 'green' : 'red'} icon={v === 'entrada' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {v === 'entrada' ? 'Entrada' : 'Saída'}
        </Tag>
      ),
    },
    { title: 'Categoria', dataIndex: 'category', key: 'category', width: 130, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Descrição', dataIndex: 'description', key: 'description' },
    {
      title: 'Valor', dataIndex: 'amount', key: 'amount', width: 140,
      sorter: (a: FinancialTransaction, b: FinancialTransaction) => a.amount - b.amount,
      render: (v: number, r: FinancialTransaction) => (
        <Text strong style={{ color: r.type === 'entrada' ? '#52c41a' : '#ff4d4f' }}>
          {r.type === 'entrada' ? '+' : '-'} R$ {fmt(v)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BankOutlined style={{ marginRight: 8 }} />
          Gestão Financeira
        </Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="Saldo Atual" value={saldo} precision={2} prefix="R$"
              styles={{ content: { color: saldo >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="MRR" value={mrr} precision={2} prefix="R$"
              suffix={<Text type="secondary" style={{ fontSize: 12 }}>/mês</Text>}
              styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="Margem Líquida" value={margem} precision={1} suffix="%"
              prefix={margem >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              styles={{ content: { color: margem >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="Comissões a Pagar" value={totalComissoesPendentes} precision={2} prefix="R$"
              styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="A Receber (planos)" value={mrr} precision={2} prefix="R$"
              styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small">
            <Statistic title="Lucro Líquido" value={lucroLiquido} precision={2} prefix="R$"
              styles={{ content: { color: lucroLiquido >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Segmented
        options={[
          { label: 'Fluxo de Caixa', value: 'fluxo', icon: <WalletOutlined /> },
          { label: 'DRE', value: 'dre', icon: <DollarOutlined /> },
          { label: 'Projeção MRR', value: 'projecao', icon: <RiseOutlined /> },
          { label: 'Contas', value: 'contas', icon: <CalendarOutlined /> },
          { label: 'Extrato', value: 'extrato', icon: <BankOutlined /> },
        ]}
        value={tab}
        onChange={(v) => setTab(v as string)}
        block
        style={{ marginBottom: 16 }}
      />

      {tab === 'fluxo' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={<><WalletOutlined style={{ marginRight: 8 }} />Fluxo de Caixa Mensal</>}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v) => `R$ ${fmt(Number(v))}`} />
                  <Legend />
                  <Bar dataKey="entradas" name="Entradas" fill="#52c41a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title={<><FallOutlined style={{ marginRight: 8 }} />Composição de Saídas</>} style={{ height: '100%' }}>
              {custoBreakdown.map((item) => (
                <div key={item.categoria} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{item.categoria}</Text>
                    <Text strong>R$ {fmt(item.valor)} ({item.percent.toFixed(1)}%)</Text>
                  </div>
                  <Progress
                    percent={item.percent}
                    showInfo={false}
                    strokeColor={item.categoria === 'Comissão' ? '#ff4d4f' : item.categoria === 'Infraestrutura' ? '#1677ff' : item.categoria === 'Marketing' ? '#722ed1' : '#faad14'}
                    size="small"
                  />
                </div>
              ))}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Total Saídas</Text>
                <Text strong style={{ color: '#ff4d4f' }}>R$ {fmt(totalSaida)}</Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {tab === 'dre' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<><DollarOutlined style={{ marginRight: 8 }} />DRE Simplificado</>}>
              <Descriptions column={1} bordered size="middle">
                {dreItems.map((item) => (
                  <Descriptions.Item
                    key={item.label}
                    label={<Text strong={item.bold}>{item.label}</Text>}
                  >
                    <Text strong={item.bold} style={{ color: item.color, fontSize: item.bold ? 18 : 14 }}>
                      R$ {fmt(Math.abs(item.value))}
                    </Text>
                  </Descriptions.Item>
                ))}
                <Descriptions.Item label={<Text strong>Margem Líquida</Text>}>
                  <Text strong style={{ color: margem >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 18 }}>
                    {margem.toFixed(1)}%
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Indicadores Financeiros">
              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <Statistic title="Receita por Associado" value={assocAtivos.length > 0 ? receitaBruta / assocAtivos.length : 0}
                    precision={2} prefix="R$" styles={{ content: { color: '#1677ff' } }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Custo por Associado" value={assocAtivos.length > 0 ? totalSaida / assocAtivos.length : 0}
                    precision={2} prefix="R$" styles={{ content: { color: '#ff7a45' } }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Comissão Média" value={comissoesPagas.length > 0 ? totalComissoesPagas / comissoesPagas.length : 0}
                    precision={2} prefix="R$" styles={{ content: { color: '#faad14' } }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Ticket Médio Venda" value={transactions.filter((t) => t.type === 'entrada').length > 0
                    ? totalEntrada / transactions.filter((t) => t.type === 'entrada').length : 0}
                    precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Comissões Pagas" value={totalComissoesPagas} precision={2} prefix="R$"
                    styles={{ content: { color: '#ff4d4f' } }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Custos Operacionais" value={custosOperacionais} precision={2} prefix="R$"
                    styles={{ content: { color: '#ff7a45' } }} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {tab === 'projecao' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={<><RiseOutlined style={{ marginRight: 8 }} />Projeção de Receita (6 meses)</>}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={mrrProjection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v) => `R$ ${fmt(Number(v))}`} />
                  <Legend />
                  <Area type="monotone" dataKey="recorrente" name="Receita Recorrente (MRR)" fill="#1677ff" stroke="#1677ff" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="vendas" name="Receita Vendas (projeção)" fill="#52c41a" stroke="#52c41a" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Receita Recorrente" style={{ marginBottom: 16 }}>
              <Statistic title="MRR Atual" value={mrr} precision={2} prefix="R$"
                styles={{ content: { color: '#1677ff', fontSize: 28 } }} />
              <Divider style={{ margin: '12px 0' }} />
              <Statistic title="ARR (projeção anual)" value={mrr * 12} precision={2} prefix="R$"
                styles={{ content: { color: '#722ed1' } }} />
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary">Composição do MRR:</Text>
              {plans.map((p) => {
                const count = assocAtivos.filter((a) => a.planId === p.id).length;
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text>{p.name} ({count}x)</Text>
                    <Text strong>R$ {fmt(p.price * count)}</Text>
                  </div>
                );
              })}
            </Card>
          </Col>
        </Row>
      )}

      {tab === 'contas' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<><ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />Comissões a Pagar ({comissoesPendentes.length})</>}>
              <Table
                dataSource={comissoesPendentes.slice(0, 10)}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
                  {
                    title: 'Associado', dataIndex: 'associadoId', key: 'assoc',
                    render: (v: string) => associados.find((a) => a.id === v)?.name ?? v,
                  },
                  {
                    title: 'Valor', dataIndex: 'commissionValue', key: 'val', width: 120,
                    render: (v: number) => <Text strong style={{ color: '#faad14' }}>R$ {fmt(v)}</Text>,
                  },
                  {
                    title: 'Status', key: 'st', width: 100,
                    render: () => <Tag color="orange" icon={<ClockCircleOutlined />}>Pendente</Tag>,
                  },
                ]}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Total a Pagar</Text>
                <Text strong style={{ color: '#faad14', fontSize: 16 }}>R$ {fmt(totalComissoesPendentes)}</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<><CheckCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />Mensalidades a Receber ({assocAtivos.length})</>}>
              <Table
                dataSource={contasReceber}
                rowKey="key"
                size="small"
                pagination={false}
                columns={[
                  { title: 'Associado', dataIndex: 'nome', key: 'nome' },
                  { title: 'Plano', dataIndex: 'plano', key: 'plano', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
                  {
                    title: 'Valor', dataIndex: 'valor', key: 'val', width: 100,
                    render: (v: number) => <Text strong style={{ color: '#1677ff' }}>R$ {fmt(v)}</Text>,
                  },
                  { title: 'Vencimento', dataIndex: 'vencimento', key: 'venc', width: 110 },
                ]}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Total a Receber</Text>
                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>R$ {fmt(mrr)}</Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {tab === 'extrato' && (
        <Card>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
              <Select.Option value="all">Todos tipos</Select.Option>
              <Select.Option value="entrada">Entradas</Select.Option>
              <Select.Option value="saida">Saídas</Select.Option>
            </Select>
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
              <Select.Option value="all">Todas categorias</Select.Option>
              {categories.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </div>
          <Table
            dataSource={filtered}
            columns={txColumns}
            rowKey="id"
            pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `${t} transações` }}
            size="middle"
          />
        </Card>
      )}
    </div>
  );
}
