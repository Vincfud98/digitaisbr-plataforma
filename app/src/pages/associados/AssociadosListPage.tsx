import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Space, Card, Typography, Badge, Popconfirm, message, Tooltip, Avatar } from 'antd';
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, InstagramOutlined, YoutubeOutlined, FireOutlined,
  TeamOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeAssociado } from '../../store/slices/associadosSlice';
import type { Associado, AssociadoStatus, PlanType } from '../../types';

const { Title, Text } = Typography;

const statusConfig: Record<AssociadoStatus, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  suspenso: { color: 'orange', label: 'Suspenso' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico' },
  intermediario: { color: 'purple', label: 'Intermediário' },
  avancado: { color: 'gold', label: 'Avançado' },
};

function formatFollowers(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

export default function AssociadosListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { list } = useAppSelector((s) => s.associados);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [planFilter, setPlanFilter] = useState<string>('todos');

  const filtered = list.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || (a.niche || '').toLowerCase().includes(search.toLowerCase()) || (a.instagram || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
    const matchPlan = planFilter === 'todos' || a.planType === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const handleDelete = (id: string) => {
    dispatch(removeAssociado(id));
    message.success('Associado removido');
  };

  const columns: ColumnsType<Associado> = [
    {
      title: 'Influencer',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <Space>
          <Badge status={record.status === 'ativo' ? 'success' : record.status === 'suspenso' ? 'warning' : 'default'}>
            <Avatar size={36} icon={<UserOutlined />} src={record.avatar} style={{ background: '#1677ff' }} />
          </Badge>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.instagram && <><InstagramOutlined style={{ color: '#E4405F' }} /> {record.instagram}</>}
              {!record.instagram && record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Nicho',
      dataIndex: 'niche',
      responsive: ['md'],
      render: (niche: string) => niche ? (
        <Tag color="magenta" style={{ borderRadius: 10 }}>
          <FireOutlined /> {niche}
        </Tag>
      ) : <Text type="secondary">—</Text>,
      filters: [...new Set(list.map((a) => a.niche).filter(Boolean))].sort().map((n) => ({ text: n!, value: n! })),
      onFilter: (value, record) => record.niche === value,
    },
    {
      title: 'Seguidores',
      dataIndex: 'followers',
      sorter: (a, b) => (a.followers || 0) - (b.followers || 0),
      render: (followers: number) => (
        <span style={{ fontWeight: 600 }}>
          <TeamOutlined style={{ color: '#1677ff', marginRight: 4 }} />
          {formatFollowers(followers)}
        </span>
      ),
      responsive: ['md'],
    },
    {
      title: 'Eng.',
      dataIndex: 'engagementRate',
      sorter: (a, b) => (a.engagementRate || 0) - (b.engagementRate || 0),
      render: (rate: number) => rate ? (
        <span style={{ fontWeight: 600, color: rate >= 5 ? '#52c41a' : rate >= 3 ? '#1677ff' : '#fa8c16' }}>
          <ThunderboltOutlined style={{ marginRight: 2 }} />
          {rate}%
        </span>
      ) : <Text type="secondary">—</Text>,
      responsive: ['md'],
    },
    {
      title: 'Redes',
      responsive: ['lg'],
      render: (_: unknown, record) => (
        <Space size={4}>
          {record.instagram && <Tooltip title={record.instagram}><InstagramOutlined style={{ fontSize: 16, color: '#E4405F' }} /></Tooltip>}
          {record.youtube && <Tooltip title={record.youtube}><YoutubeOutlined style={{ fontSize: 16, color: '#FF0000' }} /></Tooltip>}
          {record.tiktok && <Tooltip title={record.tiktok}><span style={{ fontSize: 13, fontWeight: 800 }}>T</span></Tooltip>}
        </Space>
      ),
    },
    {
      title: 'Plano',
      dataIndex: 'planType',
      render: (plan: PlanType) => <Tag color={planConfig[plan].color}>{planConfig[plan].label}</Tag>,
      filters: [
        { text: 'Básico', value: 'basico' },
        { text: 'Intermediário', value: 'intermediario' },
        { text: 'Avançado', value: 'avancado' },
      ],
      onFilter: (value, record) => record.planType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: AssociadoStatus) => <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>,
    },
    {
      title: 'Vendas',
      dataIndex: 'totalSales',
      sorter: (a, b) => a.totalSales - b.totalSales,
      render: (v: number) => v.toLocaleString('pt-BR'),
      responsive: ['lg'],
    },
    {
      title: 'Comissão',
      dataIndex: 'totalCommission',
      sorter: (a, b) => a.totalCommission - b.totalCommission,
      render: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      responsive: ['xl'],
    },
    {
      title: 'Ações',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record) => (
        <Space size="small">
          <Tooltip title="Ver perfil">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/associados/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/associados/${record.id}/editar`)} />
          </Tooltip>
          <Popconfirm title="Remover influencer?" description="Esta ação não pode ser desfeita." onConfirm={() => handleDelete(record.id)} okText="Remover" cancelText="Cancelar">
            <Tooltip title="Remover">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Gestão de Influencers
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/associados/novo')}>
          Novo Influencer
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="Buscar por nome, nicho ou @instagram..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{ value: 'todos', label: 'Todos os status' }, { value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'suspenso', label: 'Suspenso' }, { value: 'cancelado', label: 'Cancelado' }]} />
          <Select value={planFilter} onChange={setPlanFilter} style={{ width: 160 }} options={[{ value: 'todos', label: 'Todos os planos' }, { value: 'basico', label: 'Básico' }, { value: 'intermediario', label: 'Intermediário' }, { value: 'avancado', label: 'Avançado' }]} />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} influencers` }}
          size="middle"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
