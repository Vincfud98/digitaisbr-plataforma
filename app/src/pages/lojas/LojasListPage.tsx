import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Space, Card, Row, Col, Statistic, Switch, message } from 'antd';
import { SearchOutlined, ShopOutlined, EyeOutlined, SettingOutlined, ShoppingCartOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { toggleStoreActive } from '../../store/slices/lojasSlice';
import type { Store } from '../../types';

const { Title } = Typography;

export default function LojasListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stores = useAppSelector((s) => s.lojas.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const assocMap = Object.fromEntries(associados.map((a) => [a.id, a]));

  const filtered = stores.filter((s) => {
    const assoc = assocMap[s.associadoId];
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !(assoc?.name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter === 'ativa' && !s.active) return false;
    if (statusFilter === 'inativa' && s.active) return false;
    return true;
  });

  const totalAtivas = stores.filter((s) => s.active).length;
  const totalProducts = stores.reduce((sum, s) => sum + s.productIds.length, 0);
  const totalViews = stores.reduce((sum, s) => sum + s.totalViews, 0);

  const handleToggle = (storeId: string, checked: boolean) => {
    dispatch(toggleStoreActive(storeId));
    message.success(checked ? 'Loja ativada!' : 'Loja desativada!');
  };

  const columns = [
    {
      title: 'Loja',
      key: 'name',
      render: (_: unknown, r: Store) => {
        const assoc = assocMap[r.associadoId];
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{assoc?.name} — /{r.slug}</div>
          </div>
        );
      },
    },
    {
      title: 'Plano',
      key: 'plan',
      render: (_: unknown, r: Store) => {
        const assoc = assocMap[r.associadoId];
        if (!assoc) return '-';
        const colors: Record<string, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
        const labels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
        return <Tag color={colors[assoc.planType]}>{labels[assoc.planType]}</Tag>;
      },
    },
    {
      title: 'Produtos',
      key: 'products',
      sorter: (a: Store, b: Store) => a.productIds.length - b.productIds.length,
      render: (_: unknown, r: Store) => r.productIds.length,
    },
    {
      title: 'Visualizações',
      dataIndex: 'totalViews',
      key: 'views',
      sorter: (a: Store, b: Store) => a.totalViews - b.totalViews,
      render: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'Vendas',
      dataIndex: 'totalSales',
      key: 'sales',
      sorter: (a: Store, b: Store) => a.totalSales - b.totalSales,
    },
    {
      title: 'Ativa',
      key: 'active',
      render: (_: unknown, r: Store) => (
        <Switch size="small" checked={r.active} onChange={(checked) => handleToggle(r.id, checked)} />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Store) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/lojas/${r.id}/preview`)} title="Preview" />
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => navigate(`/lojas/${r.id}`)} title="Configurar" />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <ShopOutlined style={{ marginRight: 8 }} />
        Lojas Virtuais dos Associados
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Lojas Ativas" value={totalAtivas} suffix={`/ ${stores.length}`} prefix={<ShopOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Produtos nas Lojas" value={totalProducts} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Visualizações" value={totalViews} prefix={<BarChartOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar loja ou associado..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todas</Select.Option>
            <Select.Option value="ativa">Ativas</Select.Option>
            <Select.Option value="inativa">Inativas</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} lojas` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
