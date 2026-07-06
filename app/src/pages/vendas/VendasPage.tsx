import { useState, useMemo } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select, Space, Button, message, Popconfirm, Descriptions, DatePicker, Segmented, Badge, Tooltip } from 'antd';
import {
  DollarOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateSaleStatus } from '../../store/slices/vendasSlice';
import { categories } from '../../data/categories';
import type { Sale, SaleStatus } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [associadoFilter, setAssociadoFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [view, setView] = useState<string>('todas');

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const assocMap = Object.fromEntries(associados.map((a) => [a.id, a]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (associadoFilter !== 'all' && s.associadoId !== associadoFilter) return false;
      if (view === 'pendentes' && s.status !== 'pendente') return false;
      if (view === 'aprovadas' && s.status !== 'aprovada') return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const saleDate = new Date(s.createdAt);
        if (saleDate < dateRange[0].toDate() || saleDate > dateRange[1].toDate()) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const product = productMap[s.productId];
        const assoc = assocMap[s.associadoId];
        if (
          !s.customerName.toLowerCase().includes(q) &&
          !s.checkoutRef.toLowerCase().includes(q) &&
          !(product?.name.toLowerCase().includes(q)) &&
          !(assoc?.name.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [sales, statusFilter, associadoFilter, view, dateRange, search, productMap, assocMap]);

  const approvedSales = sales.filter((s) => s.status === 'aprovada');
  const totalRevenue = approvedSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalApproved = approvedSales.length;
  const totalPending = sales.filter((s) => s.status === 'pendente').length;
  const totalCancelled = sales.filter((s) => s.status === 'cancelada' || s.status === 'reembolsada').length;
  const avgTicket = totalApproved > 0 ? totalRevenue / totalApproved : 0;
  const totalCommission = approvedSales.reduce((sum, s) => {
    const product = productMap[s.productId];
    return sum + (product ? s.totalPrice * product.commissionPercent / 100 : 0);
  }, 0);
  const cancelRate = sales.length > 0 ? (totalCancelled / sales.length) * 100 : 0;

  const associadosWithSales = useMemo(() => {
    const ids = new Set(sales.map((s) => s.associadoId));
    return associados.filter((a) => ids.has(a.id));
  }, [sales, associados]);

  const handleApprove = (id: string) => {
    dispatch(updateSaleStatus({ id, status: 'aprovada' }));
    message.success('Venda aprovada!');
  };

  const handleCancel = (id: string) => {
    dispatch(updateSaleStatus({ id, status: 'cancelada' }));
    message.warning('Venda cancelada.');
  };

  const handleRefund = (id: string) => {
    dispatch(updateSaleStatus({ id, status: 'reembolsada' }));
    message.info('Venda marcada como reembolsada.');
  };

  const getCommission = (sale: Sale) => {
    const product = productMap[sale.productId];
    return product ? sale.totalPrice * product.commissionPercent / 100 : 0;
  };

  const columns = [
    {
      title: 'Ref',
      dataIndex: 'checkoutRef',
      key: 'ref',
      width: 110,
      render: (v: string) => <Text copyable={{ text: v }} style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: unknown, r: Sale) => {
        const p = productMap[r.productId];
        const cat = p ? categoryMap[p.categoryId] : null;
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>{p?.name || r.productId}</Text>
            {cat && <div><Tag color={cat.color} style={{ fontSize: 10, margin: 0 }}>{cat.name}</Tag></div>}
          </div>
        );
      },
    },
    {
      title: 'Associado',
      key: 'associado',
      render: (_: unknown, r: Sale) => {
        const a = assocMap[r.associadoId];
        return (
          <Space>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              {a?.name?.charAt(0) || '?'}
            </div>
            <Text style={{ fontSize: 13 }}>{a?.name || r.associadoId}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customer',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Qtd',
      dataIndex: 'quantity',
      key: 'qty',
      width: 55,
      align: 'center' as const,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'total',
      width: 120,
      sorter: (a: Sale, b: Sale) => a.totalPrice - b.totalPrice,
      render: (v: number) => <Text strong style={{ color: '#52c41a' }}>R$ {v.toFixed(2)}</Text>,
    },
    {
      title: 'Comissão',
      key: 'commission',
      width: 110,
      render: (_: unknown, r: Sale) => {
        const comm = getCommission(r);
        const product = productMap[r.productId];
        return (
          <Tooltip title={`${product?.commissionPercent || 0}% do total`}>
            <Text style={{ color: '#722ed1', fontSize: 13 }}>R$ {comm.toFixed(2)}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'date',
      width: 105,
      sorter: (a: Sale, b: Sale) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend' as const,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString('pt-BR')}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: SaleStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 130,
      render: (_: unknown, r: Sale) => (
        <Space size={4}>
          {r.status === 'pendente' && (
            <>
              <Popconfirm title="Aprovar esta venda?" okText="Aprovar" cancelText="Cancelar" onConfirm={() => handleApprove(r.id)}>
                <Button type="link" size="small" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} />
              </Popconfirm>
              <Popconfirm title="Cancelar esta venda?" okText="Sim, cancelar" cancelText="Não" onConfirm={() => handleCancel(r.id)}>
                <Button type="link" size="small" icon={<CloseCircleOutlined />} danger />
              </Popconfirm>
            </>
          )}
          {r.status === 'aprovada' && (
            <Popconfirm title="Reembolsar esta venda?" description={`R$ ${r.totalPrice.toFixed(2)} será devolvido ao cliente.`} okText="Reembolsar" cancelText="Não" onConfirm={() => handleRefund(r.id)}>
              <Button type="link" size="small" style={{ color: '#faad14', fontSize: 12 }}>Reembolsar</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: Sale) => {
    const product = productMap[record.productId];
    const assoc = assocMap[record.associadoId];
    const comm = getCommission(record);
    return (
      <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 4 }}>
        <Descriptions.Item label="Email do Cliente">{record.customerEmail}</Descriptions.Item>
        <Descriptions.Item label="Loja">{record.storeSlug}</Descriptions.Item>
        <Descriptions.Item label="Preço Unitário">R$ {record.unitPrice.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Comissão do Associado">
          <Text style={{ color: '#722ed1' }}>R$ {comm.toFixed(2)} ({product?.commissionPercent || 0}%)</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Associado">{assoc?.name} ({assoc?.email})</Descriptions.Item>
        <Descriptions.Item label="Produto">{product?.name} — SKU: {product?.sku}</Descriptions.Item>
        <Descriptions.Item label="Referência">{record.checkoutRef}</Descriptions.Item>
        <Descriptions.Item label="Data">{new Date(record.createdAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          Gestão de Vendas
        </Title>
        <Button icon={<DownloadOutlined />} onClick={() => message.info('Exportação será implementada com Cloud Functions.')}>Exportar CSV</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Receita Total" value={totalRevenue} precision={2} prefix="R$" styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic title="Comissões Geradas" value={totalCommission} precision={2} prefix="R$" styles={{ content: { color: '#722ed1', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Ticket Médio" value={avgTicket} precision={2} prefix="R$" styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Aprovadas" value={totalApproved} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Pendentes" value={totalPending} styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #ff4d4f' }}>
            <Statistic title="Taxa Cancelamento" value={cancelRate} precision={1} suffix="%" styles={{ content: { color: '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Segmented
            value={view}
            onChange={(v) => { setView(v as string); setStatusFilter('all'); }}
            options={[
              { label: `Todas (${sales.length})`, value: 'todas' },
              { label: <Badge count={totalPending} size="small" offset={[8, -2]}><span>Pendentes</span></Badge>, value: 'pendentes' },
              { label: `Aprovadas (${totalApproved})`, value: 'aprovadas' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por cliente, produto, ref, associado..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }} disabled={view !== 'todas'}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="pendente">Pendente</Select.Option>
            <Select.Option value="aprovada">Aprovada</Select.Option>
            <Select.Option value="cancelada">Cancelada</Select.Option>
            <Select.Option value="reembolsada">Reembolsada</Select.Option>
          </Select>
          <Select
            value={associadoFilter}
            onChange={setAssociadoFilter}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
            placeholder="Filtrar por associado"
          >
            <Select.Option value="all">Todos associados</Select.Option>
            {associadosWithSales.map((a) => (
              <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
            ))}
          </Select>
          <RangePicker
            format="DD/MM/YYYY"
            placeholder={['Data início', 'Data fim']}
            onChange={(dates) => setDateRange(dates as [any, any] | null)}
            style={{ width: 240 }}
          />
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (t) => `${t} vendas` }}
          size="middle"
          scroll={{ x: 1100 }}
          expandable={{ expandedRowRender, rowExpandable: () => true }}
        />
      </Card>
    </div>
  );
}
