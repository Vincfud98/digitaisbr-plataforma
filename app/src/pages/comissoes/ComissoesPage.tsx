import { useState } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select, Space, Button, message } from 'antd';
import { BankOutlined, SearchOutlined, DollarOutlined, CheckCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateCommissionStatus } from '../../store/slices/comissoesSlice';
import type { Commission, CommissionStatus } from '../../types';

const { Title } = Typography;

const statusConfig: Record<CommissionStatus, { color: string; label: string }> = {
  pendente: { color: 'orange', label: 'Pendente' },
  aprovada: { color: 'blue', label: 'Aprovada' },
  paga: { color: 'green', label: 'Paga' },
};

export default function ComissoesPage() {
  const dispatch = useAppDispatch();
  const commissions = useAppSelector((s) => s.comissoes.list);
  const products = useAppSelector((s) => s.catalogo.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const assocMap = Object.fromEntries(associados.map((a) => [a.id, a]));

  const filtered = commissions.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const assoc = assocMap[c.associadoId];
      const product = productMap[c.productId];
      if (!assoc?.name.toLowerCase().includes(q) && !product?.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPaid = commissions.filter((c) => c.status === 'paga').reduce((sum, c) => sum + c.commissionValue, 0);
  const totalPending = commissions.filter((c) => c.status === 'pendente' || c.status === 'aprovada').reduce((sum, c) => sum + c.commissionValue, 0);
  const totalCommissions = commissions.length;

  const handlePay = (id: string) => {
    dispatch(updateCommissionStatus({ id, status: 'paga' }));
    message.success('Comissão marcada como paga!');
  };

  const handleApprove = (id: string) => {
    dispatch(updateCommissionStatus({ id, status: 'aprovada' }));
    message.success('Comissão aprovada!');
  };

  const columns = [
    {
      title: 'Associado',
      key: 'associado',
      render: (_: unknown, r: Commission) => {
        const a = assocMap[r.associadoId];
        return a?.name || r.associadoId;
      },
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: unknown, r: Commission) => {
        const p = productMap[r.productId];
        return p?.name || r.productId;
      },
    },
    {
      title: 'Valor Venda',
      dataIndex: 'saleAmount',
      key: 'saleAmount',
      render: (v: number) => `R$ ${v.toFixed(2)}`,
    },
    {
      title: '%',
      dataIndex: 'commissionPercent',
      key: 'percent',
      width: 70,
      render: (v: number) => `${v}%`,
    },
    {
      title: 'Comissão',
      dataIndex: 'commissionValue',
      key: 'value',
      sorter: (a: Commission, b: Commission) => a.commissionValue - b.commissionValue,
      render: (v: number) => <Tag color="green">R$ {v.toFixed(2)}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'date',
      sorter: (a: Commission, b: Commission) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Pago em',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: CommissionStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Commission) => (
        <Space>
          {r.status === 'pendente' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>Aprovar</Button>
          )}
          {r.status === 'aprovada' && (
            <Button type="link" size="small" icon={<WalletOutlined />} onClick={() => handlePay(r.id)} style={{ color: '#52c41a' }}>Pagar</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <BankOutlined style={{ marginRight: 8 }} />
        Gestão de Comissões
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Pago" value={totalPaid} precision={2} prefix="R$" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Pendente / A Pagar" value={totalPending} precision={2} prefix="R$" valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Comissões" value={totalCommissions} prefix={<DollarOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por associado ou produto..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="pendente">Pendente</Select.Option>
            <Select.Option value="aprovada">Aprovada</Select.Option>
            <Select.Option value="paga">Paga</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} comissões` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
