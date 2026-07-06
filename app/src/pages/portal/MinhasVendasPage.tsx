import { useState, useMemo } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select, Segmented, Progress, Timeline, Descriptions, Empty, Tooltip } from 'antd';
import {
  ShoppingCartOutlined, SearchOutlined,
  DollarOutlined, RiseOutlined, CheckCircleOutlined,
  TrophyOutlined, StarOutlined,
  ArrowUpOutlined, UserOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { useAppSelector } from '../../store';
import type { Sale, SaleStatus } from '../../types';

const { Title, Text } = Typography;
const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusConfig: Record<SaleStatus, { color: string; hex: string; label: string }> = {
  pendente: { color: 'orange', hex: '#fa8c16', label: 'Pendente' },
  aprovada: { color: 'green', hex: '#52c41a', label: 'Aprovada' },
  cancelada: { color: 'red', hex: '#ff4d4f', label: 'Cancelada' },
  reembolsada: { color: 'purple', hex: '#722ed1', label: 'Reembolsada' },
};

export default function MinhasVendasPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tab, setTab] = useState<string>('visao');

  const associado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];
  const minhasVendas = vendas.filter((v) => v.associadoId === associado?.id);

  const productMap = Object.fromEntries(catalogo.map((p) => [p.id, p]));
  const getProductName = (productId: string) => productMap[productId]?.name || productId;
  const getCommission = (saleId: string) => comissoes.find((c) => c.saleId === saleId);

  const aprovadas = minhasVendas.filter((v) => v.status === 'aprovada');
  const receitaTotal = aprovadas.reduce((s, v) => s + v.totalPrice, 0);
  const ticketMedio = aprovadas.length > 0 ? receitaTotal / aprovadas.length : 0;
  const comissoesTotal = minhasVendas.reduce((s, v) => s + (getCommission(v.id)?.commissionValue || 0), 0);
  const comissoesPagas = minhasVendas.reduce((s, v) => {
    const c = getCommission(v.id);
    return s + (c?.status === 'paga' ? c.commissionValue : 0);
  }, 0);
  const comissoesPendentesVal = comissoesTotal - comissoesPagas;
  const taxaConversao = minhasVendas.length > 0 ? (aprovadas.length / minhasVendas.length) * 100 : 0;

  const vendasPorMes = useMemo(() => {
    const months: Record<string, { vendas: number; receita: number; comissao: number }> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    minhasVendas.forEach((v) => {
      const m = v.createdAt.slice(0, 7);
      if (!months[m]) months[m] = { vendas: 0, receita: 0, comissao: 0 };
      months[m].vendas++;
      if (v.status === 'aprovada') {
        months[m].receita += v.totalPrice;
        months[m].comissao += getCommission(v.id)?.commissionValue || 0;
      }
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => {
      const [y, m] = k.split('-');
      return { mes: `${monthNames[parseInt(m) - 1]}/${y.slice(2)}`, ...v };
    });
  }, [minhasVendas]);

  const vendasPorStatus = useMemo(() =>
    Object.entries(statusConfig).map(([k, v]) => ({
      name: v.label,
      value: minhasVendas.filter((s) => s.status === k).length,
      color: v.hex,
    })).filter((d) => d.value > 0),
  [minhasVendas]);

  const topProdutos = useMemo(() => {
    const prods: Record<string, { nome: string; vendas: number; receita: number; comissao: number }> = {};
    minhasVendas.filter((v) => v.status === 'aprovada').forEach((v) => {
      const name = getProductName(v.productId);
      if (!prods[v.productId]) prods[v.productId] = { nome: name, vendas: 0, receita: 0, comissao: 0 };
      prods[v.productId].vendas += v.quantity;
      prods[v.productId].receita += v.totalPrice;
      prods[v.productId].comissao += getCommission(v.id)?.commissionValue || 0;
    });
    return Object.values(prods).sort((a, b) => b.receita - a.receita).slice(0, 5);
  }, [minhasVendas]);

  const ultimasVendas = useMemo(() =>
    [...minhasVendas].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
  [minhasVendas]);

  const filtered = minhasVendas.filter((v) => {
    const productName = getProductName(v.productId);
    if (search && !v.customerName.toLowerCase().includes(search.toLowerCase()) && !productName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      title: 'Pedido', dataIndex: 'id', key: 'id', width: 90,
      render: (v: string) => <Tag style={{ fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Produto', key: 'product',
      render: (_: unknown, r: Sale) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{getProductName(r.productId)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>Qtd: {r.quantity}</Text>
        </div>
      ),
    },
    {
      title: 'Cliente', key: 'customer', width: 160,
      render: (_: unknown, r: Sale) => (
        <div>
          <Text style={{ fontSize: 13 }}><UserOutlined style={{ marginRight: 4 }} />{r.customerName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 10 }}>{r.customerEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Valor', dataIndex: 'totalPrice', key: 'totalPrice', width: 110,
      sorter: (a: Sale, b: Sale) => a.totalPrice - b.totalPrice,
      render: (v: number) => <Text strong style={{ color: '#52c41a' }}>R$ {fmt(v)}</Text>,
    },
    {
      title: 'Comissão', key: 'commission', width: 120,
      render: (_: unknown, r: Sale) => {
        const c = getCommission(r.id);
        if (!c) return <Text type="secondary">-</Text>;
        return (
          <Tooltip title={`Status: ${c.status === 'paga' ? 'Paga' : c.status === 'aprovada' ? 'Aprovada' : 'Pendente'}`}>
            <div>
              <Text strong style={{ color: c.status === 'paga' ? '#52c41a' : '#1677ff' }}>R$ {fmt(c.commissionValue)}</Text>
              <br />
              <Tag color={c.status === 'paga' ? 'green' : c.status === 'aprovada' ? 'blue' : 'orange'} style={{ fontSize: 10 }}>
                {c.status === 'paga' ? 'Paga' : c.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
              </Tag>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (v: SaleStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Data', dataIndex: 'createdAt', key: 'createdAt', width: 100,
      sorter: (a: Sale, b: Sale) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend' as const,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString('pt-BR')}</Text>,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Minhas Vendas
      </Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Total Vendas" value={minhasVendas.length} prefix={<ShoppingCartOutlined />}
              styles={{ content: { fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Aprovadas" value={aprovadas.length} prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a', fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Receita" value={receitaTotal} precision={2} prefix="R$"
              styles={{ content: { color: '#52c41a', fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Comissões Ganhas" value={comissoesTotal} precision={2} prefix="R$"
              styles={{ content: { color: '#1677ff', fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Ticket Médio" value={ticketMedio} precision={2} prefix="R$"
              styles={{ content: { fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <Statistic title="Conversão" value={taxaConversao} precision={1} suffix="%"
              prefix={<ArrowUpOutlined />}
              styles={{ content: { color: taxaConversao >= 50 ? '#52c41a' : '#fa8c16', fontSize: 22 } }} />
          </Card>
        </Col>
      </Row>

      <Segmented
        options={[
          { label: 'Visão Geral', value: 'visao', icon: <RiseOutlined /> },
          { label: 'Todas Vendas', value: 'vendas', icon: <ShoppingCartOutlined /> },
          { label: 'Comissões', value: 'comissoes', icon: <DollarOutlined /> },
        ]}
        value={tab}
        onChange={(v) => setTab(v as string)}
        block
        style={{ marginBottom: 16 }}
      />

      {tab === 'visao' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={16}>
              <Card title={<><RiseOutlined style={{ marginRight: 8 }} />Evolução de Vendas</>} size="small">
                {vendasPorMes.length === 0 ? (
                  <Empty description="Nenhuma venda ainda" style={{ padding: 40 }} />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={vendasPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis yAxisId="left" tickFormatter={(v) => `R$${v}`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <RTooltip formatter={(v, name) => [name === 'vendas' ? v : `R$ ${fmt(Number(v))}`, name === 'vendas' ? 'Vendas' : name === 'receita' ? 'Receita' : 'Comissão']} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="receita" name="Receita" fill="#52c41a" stroke="#52c41a" fillOpacity={0.3} />
                      <Area yAxisId="left" type="monotone" dataKey="comissao" name="Comissão" fill="#1677ff" stroke="#1677ff" fillOpacity={0.2} />
                      <Area yAxisId="right" type="monotone" dataKey="vendas" name="Vendas" fill="#722ed1" stroke="#722ed1" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title={<><StarOutlined style={{ marginRight: 8 }} />Vendas por Status</>} size="small" style={{ height: '100%' }}>
                {vendasPorStatus.length === 0 ? (
                  <Empty description="Sem dados" style={{ padding: 40 }} />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={vendasPorStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {vendasPorStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <RTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<><TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />Top Produtos</>} size="small">
                {topProdutos.length === 0 ? (
                  <Empty description="Nenhuma venda aprovada" />
                ) : (
                  topProdutos.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < topProdutos.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: i === 0 ? '#faad14' : i === 1 ? '#bfbfbf' : i === 2 ? '#d48806' : '#f0f0f0',
                          color: i < 3 ? '#fff' : '#666', fontSize: 12, fontWeight: 700,
                        }}>
                          {i + 1}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 13 }}>{p.nome}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>{p.vendas} venda(s)</Text>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: '#52c41a' }}>R$ {fmt(p.receita)}</Text>
                        <br />
                        <Text style={{ fontSize: 11, color: '#1677ff' }}>Comissão: R$ {fmt(p.comissao)}</Text>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><CalendarOutlined style={{ marginRight: 8 }} />Atividade Recente</>} size="small">
                {ultimasVendas.length === 0 ? (
                  <Empty description="Nenhuma venda" />
                ) : (
                  <Timeline
                    items={ultimasVendas.map((v) => ({
                      color: statusConfig[v.status].hex,
                      children: (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ fontSize: 13 }}>{getProductName(v.productId)}</Text>
                            <Text style={{ fontSize: 11, color: '#999' }}>{new Date(v.createdAt).toLocaleDateString('pt-BR')}</Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{v.customerName} · </Text>
                            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>R$ {fmt(v.totalPrice)}</Text>
                            <Tag color={statusConfig[v.status].color} style={{ fontSize: 10, marginLeft: 8 }}>{statusConfig[v.status].label}</Tag>
                          </div>
                        </div>
                      ),
                    }))}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}

      {tab === 'vendas' && (
        <Card>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input placeholder="Buscar por produto ou cliente..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
              <Select.Option value="all">Todos status</Select.Option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.label}</Select.Option>
              ))}
            </Select>
            <div style={{ flex: 1 }} />
            <Text type="secondary">{filtered.length} venda(s)</Text>
          </div>
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (t) => `${t} vendas` }}
            size="middle"
          />
        </Card>
      )}

      {tab === 'comissoes' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic title="Total Comissões" value={comissoesTotal} precision={2} prefix="R$"
                styles={{ content: { color: '#1677ff', fontSize: 28 } }} />
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Pagas</Text>
                  <Text strong style={{ color: '#52c41a' }}>R$ {fmt(comissoesPagas)}</Text>
                </div>
                <Progress percent={comissoesTotal > 0 ? (comissoesPagas / comissoesTotal) * 100 : 0} strokeColor="#52c41a" showInfo={false} size="small" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, marginTop: 12 }}>
                  <Text type="secondary">A receber</Text>
                  <Text strong style={{ color: '#faad14' }}>R$ {fmt(comissoesPendentesVal)}</Text>
                </div>
                <Progress percent={comissoesTotal > 0 ? (comissoesPendentesVal / comissoesTotal) * 100 : 0} strokeColor="#faad14" showInfo={false} size="small" />
              </div>
            </Card>
            <Card size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Comissão média">R$ {fmt(minhasVendas.length > 0 ? comissoesTotal / minhasVendas.length : 0)}</Descriptions.Item>
                <Descriptions.Item label="% médio">
                  {minhasVendas.length > 0 ? (comissoesTotal / (receitaTotal || 1) * 100).toFixed(1) : 0}%
                </Descriptions.Item>
                <Descriptions.Item label="Vendas com comissão">{minhasVendas.filter((v) => (getCommission(v.id)?.commissionValue || 0) > 0).length}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title={<><DollarOutlined style={{ marginRight: 8 }} />Detalhamento de Comissões</>} size="small">
              <Table
                dataSource={minhasVendas.filter((v) => {
                  const c = getCommission(v.id);
                  return c && c.commissionValue > 0;
                }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 8 }}
                columns={[
                  {
                    title: 'Produto', key: 'prod',
                    render: (_: unknown, r: Sale) => <Text style={{ fontSize: 12 }}>{getProductName(r.productId)}</Text>,
                  },
                  {
                    title: 'Venda', dataIndex: 'totalPrice', key: 'val', width: 100,
                    render: (v: number) => <Text style={{ fontSize: 12 }}>R$ {fmt(v)}</Text>,
                  },
                  {
                    title: '%', key: 'pct', width: 60,
                    render: (_: unknown, r: Sale) => {
                      const c = getCommission(r.id);
                      return <Text style={{ fontSize: 12 }}>{c?.commissionPercent || 0}%</Text>;
                    },
                  },
                  {
                    title: 'Comissão', key: 'comm', width: 110,
                    render: (_: unknown, r: Sale) => {
                      const c = getCommission(r.id);
                      return <Text strong style={{ color: '#1677ff', fontSize: 12 }}>R$ {fmt(c?.commissionValue || 0)}</Text>;
                    },
                  },
                  {
                    title: 'Status', key: 'st', width: 90,
                    render: (_: unknown, r: Sale) => {
                      const c = getCommission(r.id);
                      const st = c?.status || 'pendente';
                      return <Tag color={st === 'paga' ? 'green' : st === 'aprovada' ? 'blue' : 'orange'} style={{ fontSize: 10 }}>
                        {st === 'paga' ? 'Paga' : st === 'aprovada' ? 'Aprovada' : 'Pendente'}
                      </Tag>;
                    },
                  },
                  {
                    title: 'Data', dataIndex: 'createdAt', key: 'date', width: 90,
                    render: (v: string) => <Text style={{ fontSize: 11 }}>{new Date(v).toLocaleDateString('pt-BR')}</Text>,
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
