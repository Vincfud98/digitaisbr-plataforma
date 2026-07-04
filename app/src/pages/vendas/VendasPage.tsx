import { useState } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select, Space, Button, message } from 'antd';
import { DollarOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateSaleStatus } from '../../store/slices/vendasSlice';
import type { Sale, SaleStatus } from '../../types';

const { Title } = Typography;

const statusConfig: Record<SaleStatus, { color: string; label: string }> = {
  pendente: { color: 'orange', label: 'Pendente' },
  aprovada: { color: 'green', label: 'Aprovada' },
  cancelada: { color: 'red', label: 'Cancelada' },
  reembolsada: { color: 'default', label: 'Reembolsada' },
};

export default function VendasPage() {
  const dispatch = useAppDispatch();
  const sales = useAppSelector((s) => s.vendas.list);
  const products = useAppSelector((s) => s.catalogo.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const assocMap = Object.fromEntries(associados.map((a) => [a.id, a]));

  const filtered = sales.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const product = productMap[s.productId];
      const assoc = assocMap[s.associadoId];
      if (!s.customerName.toLowerCase().includes(q) && !s.checkoutRef.toLowerCase().includes(q) && !product?.name.toLowerCase().includes(q) && !assoc?.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalRevenue = sales.filter((s) => s.status === 'aprovada').reduce((sum, s) => sum + s.totalPrice, 0);
  const totalApproved = sales.filter((s) => s.status === 'aprovada').length;
  const totalPending = sales.filter((s) => s.status === 'pendente').length;

  const handleApprove = (id: string) => {
    dispatch(updateSaleStatus({ id, status: 'aprovada' }));
    message.success('Venda aprovada!');
  };

  const handleCancel = (id: string) => {
    dispatch(updateSaleStatus({ id, status: 'cancelada' }));
    message.success('Venda cancelada.');
  };

  const columns = [
    {
      title: 'Ref',
      dataIndex: 'checkoutRef',
      key: 'ref',
      width: 110,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: unknown, r: Sale) => {
        const p = productMap[r.productId];
        return p?.name || r.productId;
      },
    },
    {
      title: 'Associado',
      key: 'associado',
      render: (_: unknown, r: Sale) => {
        const a = assocMap[r.associadoId];
        return a?.name || r.associadoId;
      },
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customer',
    },
    {
      title: 'Qtd',
      dataIndex: 'quantity',
      key: 'qty',
      width: 60,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'total',
      sorter: (a: Sale, b: Sale) => a.totalPrice - b.totalPrice,
      render: (v: number) => `R$ ${v.toFixed(2)}`,
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'date',
      sorter: (a: Sale, b: Sale) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: SaleStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Sale) => (
        <Space>
          {r.status === 'pendente' && (
            <>
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)} style={{ color: '#52c41a' }} />
              <Button type="link" size="small" icon={<CloseCircleOutlined />} onClick={() => handleCancel(r.id)} danger />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <DollarOutlined style={{ marginRight: 8 }} />
        Gestão de Vendas
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Receita Total (aprovadas)" value={totalRevenue} precision={2} prefix="R$" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Vendas Aprovadas" value={totalApproved} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Pendentes" value={totalPending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por cliente, produto, ref..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="pendente">Pendente</Select.Option>
            <Select.Option value="aprovada">Aprovada</Select.Option>
            <Select.Option value="cancelada">Cancelada</Select.Option>
            <Select.Option value="reembolsada">Reembolsada</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} vendas` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
