import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Select, Table, Space } from 'antd';
import {
  BarChartOutlined, RiseOutlined, ShoppingCartOutlined, EyeOutlined,
  TrophyOutlined, CalendarOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';

const { Title, Text } = Typography;

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

interface DailyMetric {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

export default function PerformancePage() {
  const lojas = useAppSelector((s) => s.lojas.list);
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const associados = useAppSelector((s) => s.associados.list);
  const { user } = useAppSelector((s) => s.auth);
  const [period, setPeriod] = useState('30');

  const associado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];
  const loja = lojas.find((l) => l.associadoId === associado?.id);

  const days = parseInt(period);
  const dailyMetrics: DailyMetric[] = Array.from({ length: days }, (_, i) => {
    const seed = i * 13 + 7;
    const date = new Date(Date.now() - (days - 1 - i) * 86400000);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseMult = isWeekend ? 0.6 : 1;
    const clicks = Math.floor(seededRandom(seed) * 80 * baseMult) + 10;
    const convRate = seededRandom(seed + 1) * 0.06 + 0.02;
    const conversions = Math.floor(clicks * convRate);
    const avgPrice = seededRandom(seed + 2) * 150 + 30;
    const revenue = conversions * avgPrice;
    const commission = revenue * 0.12;
    return {
      date: date.toISOString().split('T')[0],
      clicks,
      conversions,
      revenue,
      commission,
    };
  });

  const totalClicks = dailyMetrics.reduce((s, d) => s + d.clicks, 0);
  const totalConversions = dailyMetrics.reduce((s, d) => s + d.conversions, 0);
  const totalRevenue = dailyMetrics.reduce((s, d) => s + d.revenue, 0);
  const totalCommission = dailyMetrics.reduce((s, d) => s + d.commission, 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const firstHalf = dailyMetrics.slice(0, Math.floor(days / 2));
  const secondHalf = dailyMetrics.slice(Math.floor(days / 2));
  const firstRevenue = firstHalf.reduce((s, d) => s + d.revenue, 0);
  const secondRevenue = secondHalf.reduce((s, d) => s + d.revenue, 0);
  const growthRate = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue) * 100 : 0;

  const topProducts = (loja?.productIds || []).map((pid, i) => {
    const product = catalogo.find((p) => p.id === pid);
    if (!product) return null;
    const seed = i * 17 + 5;
    return {
      key: pid,
      name: product.name,
      clicks: Math.floor(seededRandom(seed) * 200) + 10,
      conversions: Math.floor(seededRandom(seed + 1) * 30) + 1,
      revenue: Math.floor(seededRandom(seed + 2) * 5000) + 100,
    };
  }).filter(Boolean).sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0)).slice(0, 10);

  const maxClicks = Math.max(...dailyMetrics.map((d) => d.clicks), 1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Relatórios de Performance
        </Title>
        <Select value={period} onChange={setPeriod} style={{ width: 160 }} options={[
          { value: '7', label: 'Últimos 7 dias' },
          { value: '15', label: 'Últimos 15 dias' },
          { value: '30', label: 'Últimos 30 dias' },
          { value: '60', label: 'Últimos 60 dias' },
          { value: '90', label: 'Últimos 90 dias' },
        ]} />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Cliques" value={totalClicks} prefix={<EyeOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Conversões" value={totalConversions} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Taxa Conversão" value={conversionRate} precision={1} suffix="%" prefix={<RiseOutlined />} styles={{ content: { color: conversionRate > 3 ? '#52c41a' : '#faad14' } }} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Receita" value={totalRevenue} precision={2} prefix="R$" /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Comissão" value={totalCommission} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card>
            <Statistic
              title="Tendência"
              value={Math.abs(growthRate)}
              precision={1}
              suffix="%"
              prefix={growthRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              styles={{ content: { color: growthRate >= 0 ? '#52c41a' : '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={<><CalendarOutlined /> Cliques por Dia</>} size="small">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160, padding: '0 4px' }}>
              {dailyMetrics.slice(-Math.min(days, 30)).map((d, i) => {
                const height = (d.clicks / maxClicks) * 140;
                const hasConversion = d.conversions > 0;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Text style={{ fontSize: 8, color: '#8c8c8c' }}>{d.conversions > 0 ? d.conversions : ''}</Text>
                    <div style={{
                      width: '100%',
                      height,
                      minHeight: 4,
                      background: hasConversion ? '#1677ff' : '#d9d9d9',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s',
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 4px' }}>
              <Text type="secondary" style={{ fontSize: 10 }}>{dailyMetrics[Math.max(0, dailyMetrics.length - 30)]?.date.slice(5)}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>{dailyMetrics[dailyMetrics.length - 1]?.date.slice(5)}</Text>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
              <Space size={4}><div style={{ width: 12, height: 12, background: '#1677ff', borderRadius: 2 }} /><Text style={{ fontSize: 11 }}>Com conversão</Text></Space>
              <Space size={4}><div style={{ width: 12, height: 12, background: '#d9d9d9', borderRadius: 2 }} /><Text style={{ fontSize: 11 }}>Sem conversão</Text></Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><TrophyOutlined /> Top Produtos</>} size="small">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={p?.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={i < 3 ? 'gold' : 'default'} style={{ margin: 0, minWidth: 24, textAlign: 'center' }}>{i + 1}</Tag>
                  <Text style={{ fontSize: 12 }}>{p?.name}</Text>
                </div>
                <Text strong style={{ color: '#52c41a', fontSize: 12 }}>R$ {p?.revenue?.toFixed(2)}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="Métricas Diárias" size="small">
        <Table
          dataSource={[...dailyMetrics].reverse().slice(0, 15)}
          rowKey="date"
          size="small"
          pagination={{ pageSize: 7 }}
          columns={[
            { title: 'Data', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleDateString('pt-BR') },
            { title: 'Cliques', dataIndex: 'clicks' },
            { title: 'Conversões', dataIndex: 'conversions' },
            { title: 'Taxa', key: 'rate', render: (_: unknown, r: DailyMetric) => { const rate = r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0; return <Tag color={rate > 5 ? 'green' : rate > 2 ? 'orange' : 'red'}>{rate.toFixed(1)}%</Tag>; } },
            { title: 'Receita', dataIndex: 'revenue', render: (v: number) => `R$ ${v.toFixed(2)}` },
            { title: 'Comissão', dataIndex: 'commission', render: (v: number) => <Text style={{ color: '#52c41a' }}>R$ {v.toFixed(2)}</Text> },
          ]}
        />
      </Card>
    </div>
  );
}
