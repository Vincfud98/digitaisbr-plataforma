import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Input, Select, Button, Space, Table, message } from 'antd';
import {
  BarChartOutlined, SearchOutlined, StarOutlined, StarFilled, DownloadOutlined,
  TableOutlined, LineChartOutlined, FileTextOutlined, ReloadOutlined,
  ShoppingCartOutlined, DollarOutlined, TeamOutlined, BankOutlined, ShopOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { toggleFavorite, markGenerated } from '../../store/slices/relatoriosSlice';
import type { ReportConfig } from '../../types';

const { Title, Text } = Typography;

const typeConfig: Record<ReportConfig['type'], { color: string; label: string; icon: React.ReactNode }> = {
  vendas: { color: 'green', label: 'Vendas', icon: <ShoppingCartOutlined /> },
  comissoes: { color: 'gold', label: 'Comissões', icon: <DollarOutlined /> },
  associados: { color: 'blue', label: 'Associados', icon: <TeamOutlined /> },
  financeiro: { color: 'purple', label: 'Financeiro', icon: <BankOutlined /> },
  produtos: { color: 'cyan', label: 'Produtos', icon: <ShoppingCartOutlined /> },
  lojas: { color: 'orange', label: 'Lojas', icon: <ShopOutlined /> },
};

const formatConfig: Record<ReportConfig['format'], { icon: React.ReactNode; label: string }> = {
  tabela: { icon: <TableOutlined />, label: 'Tabela' },
  grafico: { icon: <LineChartOutlined />, label: 'Gráfico' },
  resumo: { icon: <FileTextOutlined />, label: 'Resumo' },
};

export default function RelatoriosPage() {
  const dispatch = useAppDispatch();
  const reports = useAppSelector((s) => s.relatorios.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [favFilter, setFavFilter] = useState<boolean>(false);

  const filtered = reports.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (favFilter && !r.favorite) return false;
    return true;
  });

  const totalReports = reports.length;
  const totalFavorites = reports.filter((r) => r.favorite).length;
  const totalGenerated = reports.filter((r) => r.lastGenerated).length;

  const columns = [
    {
      title: '',
      key: 'fav',
      width: 40,
      render: (_: unknown, r: ReportConfig) => (
        <Button
          type="text"
          size="small"
          icon={r.favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          onClick={() => dispatch(toggleFavorite(r.id))}
        />
      ),
    },
    {
      title: 'Relatório',
      key: 'name',
      render: (_: unknown, r: ReportConfig) => (
        <div>
          <Text strong>{r.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text>
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (v: ReportConfig['type']) => <Tag color={typeConfig[v].color} icon={typeConfig[v].icon}>{typeConfig[v].label}</Tag>,
    },
    {
      title: 'Formato',
      dataIndex: 'format',
      key: 'format',
      width: 100,
      render: (v: ReportConfig['format']) => <Space>{formatConfig[v].icon} {formatConfig[v].label}</Space>,
    },
    {
      title: 'Período',
      dataIndex: 'period',
      key: 'period',
      width: 100,
      render: (v: string) => <Tag>{v.charAt(0).toUpperCase() + v.slice(1)}</Tag>,
    },
    {
      title: 'Última Geração',
      dataIndex: 'lastGenerated',
      key: 'lastGenerated',
      width: 140,
      render: (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : <Text type="secondary">Nunca</Text>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 160,
      render: (_: unknown, r: ReportConfig) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => { dispatch(markGenerated(r.id)); message.success(`Relatório "${r.name}" gerado!`); }}
          >
            Gerar
          </Button>
          <Button size="small" icon={<DownloadOutlined />} disabled={!r.lastGenerated}>
            CSV
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <BarChartOutlined style={{ marginRight: 8 }} />
        Relatórios e Analytics
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Relatórios" value={totalReports} prefix={<BarChartOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Favoritos" value={totalFavorites} prefix={<StarFilled />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Já Gerados" value={totalGenerated} prefix={<BarChartOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar relatório..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
            ))}
          </Select>
          <Button
            type={favFilter ? 'primary' : 'default'}
            icon={<StarFilled />}
            onClick={() => setFavFilter(!favFilter)}
          >
            Favoritos
          </Button>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 12, showSizeChanger: false, showTotal: (t) => `${t} relatórios` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
