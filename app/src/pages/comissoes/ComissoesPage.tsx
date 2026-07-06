import { useState, useMemo } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Input, Select, Space, Button, message, Segmented, Badge, Descriptions, DatePicker } from 'antd';
import { BankOutlined, SearchOutlined, DollarOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store';
import { categories } from '../../data/categories';
import type { Commission, CommissionStatus } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<CommissionStatus, { color: string; label: string }> = {
  pendente: { color: 'orange', label: 'Aguardando Pgto' },
  aprovada: { color: 'blue', label: 'Processando' },
  paga: { color: 'green', label: 'Paga' },
};

export default function ComissoesPage() {
  const commissions = useAppSelector((s) => s.comissoes.list);
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
    return commissions.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (associadoFilter !== 'all' && c.associadoId !== associadoFilter) return false;
      if (view === 'a_pagar' && c.status !== 'aprovada') return false;
      if (view === 'pagas' && c.status !== 'paga') return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const d = new Date(c.createdAt);
        if (d < dateRange[0].toDate() || d > dateRange[1].toDate()) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const assoc = assocMap[c.associadoId];
        const product = productMap[c.productId];
        if (!(assoc?.name.toLowerCase().includes(q)) && !(product?.name.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [commissions, statusFilter, associadoFilter, view, dateRange, search, assocMap, productMap]);

  const paidComms = commissions.filter((c) => c.status === 'paga');
  const toPayComms = commissions.filter((c) => c.status === 'aprovada');
  const pendingComms = commissions.filter((c) => c.status === 'pendente');
  const totalPaid = paidComms.reduce((sum, c) => sum + c.commissionValue, 0);
  const totalToPay = toPayComms.reduce((sum, c) => sum + c.commissionValue, 0);
  const totalPending = pendingComms.reduce((sum, c) => sum + c.commissionValue, 0);
  const avgCommissionPercent = commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.commissionPercent, 0) / commissions.length : 0;

  const associadoSummary = useMemo(() => {
    const map = new Map<string, { name: string; total: number; paid: number; toPay: number; count: number }>();
    commissions.forEach((c) => {
      const assoc = assocMap[c.associadoId];
      const entry = map.get(c.associadoId) || { name: assoc?.name || c.associadoId, total: 0, paid: 0, toPay: 0, count: 0 };
      entry.total += c.commissionValue;
      entry.count++;
      if (c.status === 'paga') entry.paid += c.commissionValue;
      if (c.status === 'aprovada') entry.toPay += c.commissionValue;
      map.set(c.associadoId, entry);
    });
    return Array.from(map.entries()).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.total - a.total);
  }, [commissions, assocMap]);

  const associadosWithComms = useMemo(() => {
    const ids = new Set(commissions.map((c) => c.associadoId));
    return associados.filter((a) => ids.has(a.id));
  }, [commissions, associados]);

  const columns = [
    {
      title: 'Associado',
      key: 'associado',
      render: (_: unknown, r: Commission) => {
        const a = assocMap[r.associadoId];
        return (
          <Space>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
              {a?.name?.charAt(0) || '?'}
            </div>
            <div>
              <Text strong style={{ fontSize: 13 }}>{a?.name || r.associadoId}</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>{a?.email}</Text></div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Produto',
      key: 'product',
      render: (_: unknown, r: Commission) => {
        const p = productMap[r.productId];
        const cat = p ? categoryMap[p.categoryId] : null;
        return (
          <div>
            <Text style={{ fontSize: 13 }}>{p?.name || r.productId}</Text>
            {cat && <div><Tag color={cat.color} style={{ fontSize: 10, margin: 0 }}>{cat.name}</Tag></div>}
          </div>
        );
      },
    },
    {
      title: 'Venda',
      dataIndex: 'saleAmount',
      key: 'saleAmount',
      width: 110,
      render: (v: number) => <Text style={{ fontSize: 13 }}>R$ {v.toFixed(2)}</Text>,
    },
    {
      title: '%',
      dataIndex: 'commissionPercent',
      key: 'percent',
      width: 60,
      align: 'center' as const,
      render: (v: number) => <Tag color="purple">{v}%</Tag>,
    },
    {
      title: 'Comissão',
      dataIndex: 'commissionValue',
      key: 'value',
      width: 120,
      sorter: (a: Commission, b: Commission) => a.commissionValue - b.commissionValue,
      render: (v: number) => <Text strong style={{ color: '#52c41a', fontSize: 14 }}>R$ {v.toFixed(2)}</Text>,
    },
    {
      title: 'Data Venda',
      dataIndex: 'createdAt',
      key: 'date',
      width: 105,
      sorter: (a: Commission, b: Commission) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend' as const,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString('pt-BR')}</Text>,
    },
    {
      title: 'Pago em',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 105,
      render: (v: string | null) => v ? <Text style={{ fontSize: 12, color: '#52c41a' }}>{new Date(v).toLocaleDateString('pt-BR')}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: CommissionStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
  ];

  const expandedRowRender = (record: Commission) => {
    const product = productMap[record.productId];
    const assoc = assocMap[record.associadoId];
    return (
      <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 4 }}>
        <Descriptions.Item label="Associado">{assoc?.name} ({assoc?.email})</Descriptions.Item>
        <Descriptions.Item label="Produto">{product?.name} — SKU: {product?.sku}</Descriptions.Item>
        <Descriptions.Item label="Venda Ref">#{record.saleId}</Descriptions.Item>
        <Descriptions.Item label="Cálculo">R$ {record.saleAmount.toFixed(2)} × {record.commissionPercent}% = <Text strong style={{ color: '#52c41a' }}>R$ {record.commissionValue.toFixed(2)}</Text></Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BankOutlined style={{ marginRight: 8 }} />
          Gestão de Comissões
        </Title>
        <Button icon={<DownloadOutlined />} onClick={() => message.info('Exportação será implementada com Cloud Functions.')}>Exportar</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Total Pago" value={totalPaid} precision={2} prefix="R$" styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Processando" value={totalToPay} precision={2} prefix="R$" styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Aguardando Venda" value={totalPending} precision={2} prefix="R$" styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic title="Comissão Média" value={avgCommissionPercent} precision={1} suffix="%" styles={{ content: { color: '#722ed1', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #888' }}>
            <Statistic title="Total Registros" value={commissions.length} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<><DollarOutlined style={{ marginRight: 8 }} />Comissões por Associado</>} size="small">
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {associadoSummary.slice(0, 8).map((a) => (
                <div key={a.id} style={{ minWidth: 180, padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                      {a.name.charAt(0)}
                    </div>
                    <Text strong style={{ fontSize: 12 }}>{a.name}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary">Total:</Text>
                    <Text strong>R$ {a.total.toFixed(2)}</Text>
                  </div>
                  {a.toPay > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <Text type="secondary">Processando:</Text>
                      <Text style={{ color: '#1677ff' }}>R$ {a.toPay.toFixed(2)}</Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                    <Text type="secondary">{a.count} vendas</Text>
                    <Tag color="green" style={{ fontSize: 10, margin: 0 }}>R$ {a.paid.toFixed(2)} pago</Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Segmented
            value={view}
            onChange={(v) => { setView(v as string); setStatusFilter('all'); }}
            options={[
              { label: `Todas (${commissions.length})`, value: 'todas' },
              { label: <Badge count={toPayComms.length} size="small" offset={[8, -2]}><span>Processando</span></Badge>, value: 'a_pagar' },
              { label: `Pagas (${paidComms.length})`, value: 'pagas' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por associado ou produto..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }} disabled={view !== 'todas'}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="pendente">Aguardando Pgto</Select.Option>
            <Select.Option value="aprovada">Processando</Select.Option>
            <Select.Option value="paga">Paga</Select.Option>
          </Select>
          <Select value={associadoFilter} onChange={setAssociadoFilter} style={{ width: 200 }} showSearch optionFilterProp="children">
            <Select.Option value="all">Todos associados</Select.Option>
            {associadosWithComms.map((a) => (
              <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
            ))}
          </Select>
          <RangePicker format="DD/MM/YYYY" placeholder={['Data início', 'Data fim']} onChange={(dates) => setDateRange(dates as [any, any] | null)} style={{ width: 240 }} />
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (t) => `${t} comissões` }}
          size="middle"
          scroll={{ x: 1100 }}
          expandable={{ expandedRowRender, rowExpandable: () => true }}
        />
      </Card>
    </div>
  );
}
