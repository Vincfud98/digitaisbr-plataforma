import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Space, Popconfirm, message, Card, Row, Col, Statistic } from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  ShoppingCartOutlined, AppstoreOutlined, DollarOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeProduct } from '../../store/slices/catalogoSlice';
import { categories } from '../../data/categories';
import type { Product, ProductStatus, ProductExclusivity } from '../../types';

const { Title } = Typography;

const statusConfig: Record<ProductStatus, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  esgotado: { color: 'red', label: 'Esgotado' },
};

const exclusivityConfig: Record<ProductExclusivity, { color: string; label: string }> = {
  todos: { color: 'blue', label: 'Todos' },
  intermediario: { color: 'purple', label: 'Intermediário+' },
  avancado: { color: 'gold', label: 'Avançado' },
};

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export default function CatalogoListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.catalogo.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [exclusivityFilter, setExclusivityFilter] = useState<string>('all');

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    if (exclusivityFilter !== 'all' && p.exclusivity !== exclusivityFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    dispatch(removeProduct(id));
    message.success('Produto removido com sucesso!');
  };

  const totalAtivos = products.filter((p) => p.status === 'ativo').length;
  const avgCommission = products.length > 0 ? products.reduce((sum, p) => sum + p.commissionPercent, 0) / products.length : 0;

  const columns = [
    {
      title: 'Produto',
      key: 'name',
      render: (_: unknown, r: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>SKU: {r.sku}</div>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoryId',
      key: 'category',
      render: (catId: string) => {
        const cat = categoryMap[catId];
        return cat ? <Tag color={cat.color}>{cat.name}</Tag> : catId;
      },
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (v: number) => `R$ ${v.toFixed(2)}`,
    },
    {
      title: 'Comissão',
      dataIndex: 'commissionPercent',
      key: 'commission',
      sorter: (a: Product, b: Product) => a.commissionPercent - b.commissionPercent,
      render: (v: number) => <Tag color="green">{v}%</Tag>,
    },
    {
      title: 'Estoque',
      dataIndex: 'stock',
      key: 'stock',
      render: (v: number) => (v === -1 ? <Tag color="blue">Ilimitado</Tag> : v === 0 ? <Tag color="red">Esgotado</Tag> : v),
    },
    {
      title: 'Exclusividade',
      dataIndex: 'exclusivity',
      key: 'exclusivity',
      render: (v: ProductExclusivity) => <Tag color={exclusivityConfig[v].color}>{exclusivityConfig[v].label}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: ProductStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_: unknown, r: Product) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/catalogo/${r.id}`)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/catalogo/${r.id}/editar`)} />
          <Popconfirm title="Remover produto?" onConfirm={() => handleDelete(r.id)} okText="Sim" cancelText="Não">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Catálogo de Produtos
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/catalogo/novo')}>
          Novo Produto
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Produtos" value={products.length} prefix={<AppstoreOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Produtos Ativos" value={totalAtivos} prefix={<InboxOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Comissão Média" value={avgCommission.toFixed(1)} suffix="%" prefix={<DollarOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por nome ou SKU..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
            <Select.Option value="all">Todas categorias</Select.Option>
            {categories.map((c) => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="ativo">Ativo</Select.Option>
            <Select.Option value="inativo">Inativo</Select.Option>
            <Select.Option value="esgotado">Esgotado</Select.Option>
          </Select>
          <Select value={exclusivityFilter} onChange={setExclusivityFilter} style={{ width: 180 }}>
            <Select.Option value="all">Toda exclusividade</Select.Option>
            <Select.Option value="todos">Todos os planos</Select.Option>
            <Select.Option value="intermediario">Intermediário+</Select.Option>
            <Select.Option value="avancado">Avançado</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} produtos` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
