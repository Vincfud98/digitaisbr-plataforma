import { useState, useMemo } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Select, Table, Segmented, message, Button } from 'antd';
import {
  BarChartOutlined, ShoppingCartOutlined, TeamOutlined,
  RiseOutlined, ArrowUpOutlined, ArrowDownOutlined,
  TrophyOutlined, ShopOutlined, DownloadOutlined, CrownOutlined,
  FireOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppSelector } from '../../store';

const { Title, Text } = Typography;

const COLORS = ['#4361ee', '#3a86ff', '#06d6a0', '#ffd166', '#ef476f', '#7209b7', '#00b4d8', '#f77f00'];

const chartCardStyle: React.CSSProperties = { borderRadius: 12, overflow: 'hidden' };
const kpiCardStyle = (color: string): React.CSSProperties => ({
  borderRadius: 10, borderLeft: `4px solid ${color}`, minHeight: 88,
});

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = '﻿';
  const csv = bom + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  message.success(`${filename} exportado!`);
}

type Period = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';

function filterByPeriod<T extends { createdAt: string }>(items: T[], period: Period): T[] {
  if (period === 'all') return items;
  const now = Date.now();
  const ms: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
  const cutoff = now - (ms[period] || 30) * 86400000;
  return items.filter((i) => new Date(i.createdAt).getTime() >= cutoff);
}

export default function RelatoriosPage() {
  const vendas = useAppSelector((s) => s.vendas.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const associados = useAppSelector((s) => s.associados.list);
  const produtos = useAppSelector((s) => s.catalogo.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const financeiro = useAppSelector((s) => s.financeiro.list);

  const [period, setPeriod] = useState<Period>('all');
  const [tab, setTab] = useState<string>('geral');

  const vendasFiltradas = useMemo(() => filterByPeriod(vendas, period), [vendas, period]);
  const comissoesFiltradas = useMemo(() => filterByPeriod(comissoes, period), [comissoes, period]);

  const vendasAprovadas = vendasFiltradas.filter((v) => v.status === 'aprovada');
  const receitaTotal = vendasAprovadas.reduce((s, v) => s + v.totalPrice, 0);
  const ticketMedio = vendasAprovadas.length > 0 ? receitaTotal / vendasAprovadas.length : 0;
  const taxaConversao = vendasFiltradas.length > 0 ? (vendasAprovadas.length / vendasFiltradas.length) * 100 : 0;
  const comissaoTotal = comissoesFiltradas.reduce((s, c) => s + c.commissionValue, 0);
  const comissaoPaga = comissoesFiltradas.filter((c) => c.status === 'paga').reduce((s, c) => s + c.commissionValue, 0);
  const comissaoPendente = comissoesFiltradas.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.commissionValue, 0);

  const entradas = financeiro.filter((t) => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
  const saidas = financeiro.filter((t) => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
  const saldo = entradas - saidas;

  const assocAtivos = associados.filter((a) => a.status === 'ativo').length;
  const lojasAtivas = lojas.filter((l) => l.active).length;

  // Charts data
  const vendasPorMes = useMemo(() => {
    const map: Record<string, { mes: string; vendas: number; receita: number }> = {};
    vendasFiltradas.forEach((v) => {
      const d = new Date(v.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { mes: label, vendas: 0, receita: 0 };
      map[key].vendas++;
      if (v.status === 'aprovada') map[key].receita += v.totalPrice;
    });
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [vendasFiltradas]);

  const vendasPorStatus = useMemo(() => {
    const map: Record<string, number> = {};
    vendasFiltradas.forEach((v) => { map[v.status] = (map[v.status] || 0) + 1; });
    const labels: Record<string, string> = { pendente: 'Pendente', aprovada: 'Aprovada', cancelada: 'Cancelada', reembolsada: 'Reembolsada' };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [vendasFiltradas]);

  const assocPorPlano = useMemo(() => {
    const map: Record<string, number> = {};
    associados.forEach((a) => { map[a.planType] = (map[a.planType] || 0) + 1; });
    const labels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [associados]);

  const topProdutos = useMemo(() => {
    const map: Record<string, { name: string; vendas: number; receita: number }> = {};
    vendasAprovadas.forEach((v) => {
      const prod = produtos.find((p) => p.id === v.productId);
      const name = prod?.name || v.productId;
      if (!map[v.productId]) map[v.productId] = { name, vendas: 0, receita: 0 };
      map[v.productId].vendas += v.quantity;
      map[v.productId].receita += v.totalPrice;
    });
    return Object.values(map).sort((a, b) => b.receita - a.receita).slice(0, 8);
  }, [vendasAprovadas, produtos]);

  const topAssociados = useMemo(() => {
    const map: Record<string, { name: string; vendas: number; receita: number; comissao: number }> = {};
    vendasAprovadas.forEach((v) => {
      const assoc = associados.find((a) => a.id === v.associadoId);
      const name = assoc?.name || v.associadoId;
      if (!map[v.associadoId]) map[v.associadoId] = { name, vendas: 0, receita: 0, comissao: 0 };
      map[v.associadoId].vendas++;
      map[v.associadoId].receita += v.totalPrice;
    });
    comissoesFiltradas.forEach((c) => {
      if (map[c.associadoId]) map[c.associadoId].comissao += c.commissionValue;
    });
    return Object.values(map).sort((a, b) => b.receita - a.receita).slice(0, 10);
  }, [vendasAprovadas, associados, comissoesFiltradas]);

  const topLojas = useMemo(() => {
    return [...lojas]
      .filter((l) => l.active)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 8)
      .map((l) => ({ name: l.name, vendas: l.totalSales, visitas: l.totalViews, produtos: l.productIds.length }));
  }, [lojas]);

  const comissoesPorStatus = useMemo(() => {
    const map: Record<string, number> = {};
    comissoesFiltradas.forEach((c) => { map[c.status] = (map[c.status] || 0) + c.commissionValue; });
    const labels: Record<string, string> = { pendente: 'Pendente', aprovada: 'Aprovada', paga: 'Paga' };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: Math.round(v * 100) / 100 }));
  }, [comissoesFiltradas]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportVendas = () => {
    const headers = ['Data', 'Produto', 'Cliente', 'Quantidade', 'Total', 'Status'];
    const rows = vendasFiltradas.map((v) => [
      new Date(v.createdAt).toLocaleDateString('pt-BR'),
      produtos.find((p) => p.id === v.productId)?.name || v.productId,
      v.customerName, String(v.quantity),
      v.totalPrice.toFixed(2).replace('.', ','), v.status,
    ]);
    exportCSV('vendas.csv', headers, rows);
  };

  const handleExportComissoes = () => {
    const headers = ['Data', 'Associado', 'Valor Venda', 'Comissão %', 'Valor Comissão', 'Status'];
    const rows = comissoesFiltradas.map((c) => [
      new Date(c.createdAt).toLocaleDateString('pt-BR'),
      associados.find((a) => a.id === c.associadoId)?.name || c.associadoId,
      c.saleAmount.toFixed(2).replace('.', ','),
      String(c.commissionPercent), c.commissionValue.toFixed(2).replace('.', ','), c.status,
    ]);
    exportCSV('comissoes.csv', headers, rows);
  };

  const handleExportAssociados = () => {
    const headers = ['Nome', 'Email', 'Plano', 'Status', 'Vendas', 'Comissão Total', 'Desde'];
    const rows = associados.map((a) => [
      a.name, a.email, a.planType, a.status,
      String(a.totalSales), a.totalCommission.toFixed(2).replace('.', ','),
      new Date(a.createdAt).toLocaleDateString('pt-BR'),
    ]);
    exportCSV('associados.csv', headers, rows);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}><BarChartOutlined style={{ marginRight: 8 }} />Relatórios e Analytics</Title>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CalendarOutlined style={{ color: '#888' }} />
          <Select value={period} onChange={(v) => setPeriod(v)} style={{ width: 160 }}>
            <Select.Option value="7d">Últimos 7 dias</Select.Option>
            <Select.Option value="30d">Últimos 30 dias</Select.Option>
            <Select.Option value="90d">Últimos 3 meses</Select.Option>
            <Select.Option value="6m">Últimos 6 meses</Select.Option>
            <Select.Option value="1y">Último ano</Select.Option>
            <Select.Option value="all">Todo período</Select.Option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle('#4361ee')}>
            <Statistic title="Receita Total" value={receitaTotal} prefix="R$" precision={2} styles={{ content: { fontSize: 17, fontWeight: 700, color: '#4361ee' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle('#06d6a0')}>
            <Statistic title="Vendas Aprovadas" value={vendasAprovadas.length} prefix={<CheckCircleOutlined />} styles={{ content: { fontSize: 17, fontWeight: 700, color: '#06d6a0' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle('#7209b7')}>
            <Statistic title="Ticket Médio" value={ticketMedio} prefix="R$" precision={2} styles={{ content: { fontSize: 17, fontWeight: 700, color: '#7209b7' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle('#ffd166')}>
            <Statistic title="Taxa Conversão" value={taxaConversao} suffix="%" precision={1} styles={{ content: { fontSize: 17, fontWeight: 700, color: '#d4a017' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle('#00b4d8')}>
            <Statistic title="Associados Ativos" value={assocAtivos} prefix={<TeamOutlined />} styles={{ content: { fontSize: 17, fontWeight: 700, color: '#00b4d8' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={kpiCardStyle(saldo >= 0 ? '#06d6a0' : '#ef476f')}>
            <Statistic title="Saldo Financeiro" value={saldo} prefix={saldo >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} precision={2} styles={{ content: { fontSize: 17, fontWeight: 700, color: saldo >= 0 ? '#06d6a0' : '#ef476f' } }} />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <div style={{ marginBottom: 16 }}>
        <Segmented value={tab} onChange={(v) => setTab(v as string)} options={[
          { label: 'Visão Geral', value: 'geral' },
          { label: 'Vendas', value: 'vendas' },
          { label: 'Comissões', value: 'comissoes' },
          { label: 'Associados', value: 'associados' },
          { label: 'Lojas', value: 'lojas' },
        ]} />
      </div>

      {tab === 'geral' && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card size="small" style={chartCardStyle} title={<><RiseOutlined style={{ color: '#4361ee', marginRight: 6 }} />Receita por Mês</>}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={vendasPorMes} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4361ee" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#4361ee" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="receita" stroke="#4361ee" strokeWidth={2.5} fill="url(#gradReceita)" name="Receita" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" style={chartCardStyle} title={<><ShoppingCartOutlined style={{ color: '#06d6a0', marginRight: 6 }} />Vendas por Status</>}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={vendasPorStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} cornerRadius={4}>
                      {vendasPorStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card size="small" style={chartCardStyle} title={<><FireOutlined style={{ color: '#ef476f', marginRight: 6 }} />Top Produtos por Receita</>}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProdutos} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="receita" fill="#4361ee" name="Receita" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" style={chartCardStyle} title={<><CrownOutlined style={{ color: '#7209b7', marginRight: 6 }} />Associados por Plano</>}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={assocPorPlano} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} cornerRadius={4}>
                      <Cell fill="#3a86ff" />
                      <Cell fill="#7209b7" />
                      <Cell fill="#ffd166" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {tab === 'vendas' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Vendas" value={vendasFiltradas.length} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#1677ff', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Aprovadas" value={vendasAprovadas.length} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Receita" value={receitaTotal} prefix="R$" precision={2} styles={{ content: { color: '#722ed1', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Ticket Médio" value={ticketMedio} prefix="R$" precision={2} styles={{ content: { color: '#faad14', fontSize: 18 } }} /></Card></Col>
          </Row>
          <Card size="small" style={chartCardStyle} title="Vendas por Mês" extra={<Button size="small" icon={<DownloadOutlined />} onClick={handleExportVendas}>Exportar CSV</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorMes} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, name) => name === 'receita' ? fmt(Number(v)) : v} contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                <Bar yAxisId="left" dataKey="vendas" fill="#4361ee" name="Qtd Vendas" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="receita" fill="#06d6a0" name="Receita" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card size="small" title="Top Produtos" style={{ marginTop: 16 }}>
            <Table dataSource={topProdutos} rowKey="name" pagination={false} size="small" columns={[
              { title: '#', key: 'pos', width: 40, render: (_, __, i) => <Tag color={i < 3 ? 'gold' : 'default'}>{i + 1}</Tag> },
              { title: 'Produto', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
              { title: 'Vendas', dataIndex: 'vendas', key: 'vendas', width: 100, render: (v: number) => v },
              { title: 'Receita', dataIndex: 'receita', key: 'receita', width: 140, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>{fmt(v)}</Text> },
            ]} />
          </Card>
        </>
      )}

      {tab === 'comissoes' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Comissão Total" value={comissaoTotal} prefix="R$" precision={2} styles={{ content: { color: '#1677ff', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Paga" value={comissaoPaga} prefix="R$" precision={2} styles={{ content: { color: '#52c41a', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Pendente" value={comissaoPendente} prefix="R$" precision={2} styles={{ content: { color: '#faad14', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Registros" value={comissoesFiltradas.length} prefix={<ClockCircleOutlined />} styles={{ content: { color: '#722ed1', fontSize: 18 } }} /></Card></Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card size="small" style={chartCardStyle} title="Comissões por Status" extra={<Button size="small" icon={<DownloadOutlined />} onClick={handleExportComissoes}>Exportar CSV</Button>}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={comissoesPorStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} cornerRadius={4}>
                      <Cell fill="#ffd166" />
                      <Cell fill="#3a86ff" />
                      <Cell fill="#06d6a0" />
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Top Associados por Comissão">
                <Table dataSource={topAssociados} rowKey="name" pagination={false} size="small" columns={[
                  { title: '#', key: 'pos', width: 40, render: (_, __, i) => <Tag color={i < 3 ? 'gold' : 'default'}>{i + 1}</Tag> },
                  { title: 'Associado', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
                  { title: 'Vendas', dataIndex: 'vendas', key: 'vendas', width: 70 },
                  { title: 'Comissão', dataIndex: 'comissao', key: 'comissao', width: 130, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>{fmt(v)}</Text> },
                ]} />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {tab === 'associados' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total" value={associados.length} prefix={<TeamOutlined />} styles={{ content: { color: '#1677ff', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Ativos" value={assocAtivos} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Lojas Ativas" value={lojasAtivas} prefix={<ShopOutlined />} styles={{ content: { color: '#722ed1', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Taxa Ativação" value={associados.length > 0 ? (assocAtivos / associados.length) * 100 : 0} suffix="%" precision={1} styles={{ content: { color: '#faad14', fontSize: 18 } }} /></Card></Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={10}>
              <Card size="small" style={chartCardStyle} title="Distribuição por Plano" extra={<Button size="small" icon={<DownloadOutlined />} onClick={handleExportAssociados}>Exportar CSV</Button>}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={assocPorPlano} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} cornerRadius={4}>
                      <Cell fill="#3a86ff" />
                      <Cell fill="#7209b7" />
                      <Cell fill="#ffd166" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Card size="small" title={<><TrophyOutlined style={{ color: '#faad14', marginRight: 6 }} />Top Associados por Receita</>}>
                <Table dataSource={topAssociados} rowKey="name" pagination={false} size="small" columns={[
                  { title: '#', key: 'pos', width: 40, render: (_, __, i) => <Tag color={i < 3 ? 'gold' : 'default'}>{i + 1}</Tag> },
                  { title: 'Associado', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
                  { title: 'Vendas', dataIndex: 'vendas', key: 'vendas', width: 70 },
                  { title: 'Receita', dataIndex: 'receita', key: 'receita', width: 130, render: (v: number) => <Text strong style={{ color: '#1677ff' }}>{fmt(v)}</Text> },
                  { title: 'Comissão', dataIndex: 'comissao', key: 'comissao', width: 130, render: (v: number) => <Text style={{ color: '#52c41a' }}>{fmt(v)}</Text> },
                ]} />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {tab === 'lojas' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Lojas" value={lojas.length} prefix={<ShopOutlined />} styles={{ content: { color: '#1677ff', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Ativas" value={lojasAtivas} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Visitas" value={lojas.reduce((s, l) => s + l.totalViews, 0)} prefix={<RiseOutlined />} styles={{ content: { color: '#722ed1', fontSize: 18 } }} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small"><Statistic title="Total Vendas" value={lojas.reduce((s, l) => s + l.totalSales, 0)} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#faad14', fontSize: 18 } }} /></Card></Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card size="small" style={chartCardStyle} title="Top Lojas por Vendas">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topLojas} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="vendas" fill="#4361ee" name="Vendas" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Ranking de Lojas">
                <Table dataSource={topLojas} rowKey="name" pagination={false} size="small" columns={[
                  { title: '#', key: 'pos', width: 40, render: (_, __, i) => <Tag color={i < 3 ? 'gold' : 'default'}>{i + 1}</Tag> },
                  { title: 'Loja', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
                  { title: 'Vendas', dataIndex: 'vendas', key: 'vendas', width: 80 },
                  { title: 'Visitas', dataIndex: 'visitas', key: 'visitas', width: 80 },
                  { title: 'Produtos', dataIndex: 'produtos', key: 'produtos', width: 80 },
                ]} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
