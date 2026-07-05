import { useState } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { Sale, SaleStatus } from '../../types';

const { Title, Text } = Typography;

const statusConfig: Record<SaleStatus, { color: string; label: string }> = {
  pendente: { color: 'orange', label: 'Pendente' },
  aprovada: { color: 'green', label: 'Aprovada' },
  cancelada: { color: 'red', label: 'Cancelada' },
  reembolsada: { color: 'purple', label: 'Reembolsada' },
};

export default function MinhasVendasPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const minhasVendas = vendas.filter((v) => v.associadoId === associado?.id);

  const getProductName = (productId: string) => catalogo.find((p) => p.id === productId)?.name || productId;
  const getCommission = (saleId: string) => comissoes.find((c) => c.saleId === saleId)?.commissionValue || 0;

  const filtered = minhasVendas.filter((v) => {
    const productName = getProductName(v.productId);
    if (search && !v.customerName.toLowerCase().includes(search.toLowerCase()) && !productName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const aprovadas = minhasVendas.filter((v) => v.status === 'aprovada');
  const receitaTotal = aprovadas.reduce((s, v) => s + v.totalPrice, 0);
  const pendentes = minhasVendas.filter((v) => v.status === 'pendente');
  const ticketMedio = aprovadas.length > 0 ? receitaTotal / aprovadas.length : 0;

  const columns = [
    {
      title: 'Pedido',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: unknown, r: Sale) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{getProductName(r.productId)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>Qtd: {r.quantity}</Text>
        </div>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customer',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Valor',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (v: number) => <Text strong style={{ color: '#52c41a' }}>R$ {v.toFixed(2)}</Text>,
    },
    {
      title: 'Comissão',
      key: 'commission',
      width: 120,
      render: (_: unknown, r: Sale) => {
        const comm = getCommission(r.id);
        return <Text style={{ color: '#1677ff' }}>R$ {comm.toFixed(2)}</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: SaleStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Minhas Vendas
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Total de Vendas" value={minhasVendas.length} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Receita Aprovada" value={receitaTotal} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Pendentes" value={pendentes.length} prefix={<ClockCircleOutlined />} styles={{ content: { color: '#fa8c16' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Ticket Médio" value={ticketMedio} precision={2} prefix="R$" /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por produto ou cliente..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos status</Select.Option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v.label}</Select.Option>
            ))}
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `${t} vendas` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
