import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Space, Card, Typography, Badge, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeAssociado } from '../../store/slices/associadosSlice';
import type { Associado, AssociadoStatus, PlanType } from '../../types';

const { Title } = Typography;

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

export default function AssociadosListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { list } = useAppSelector((s) => s.associados);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [planFilter, setPlanFilter] = useState<string>('todos');

  const filtered = list.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.cpfCnpj.includes(search);
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
      title: 'Associado',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <Space>
          <Badge status={record.status === 'ativo' ? 'success' : record.status === 'suspenso' ? 'warning' : 'default'} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'CPF/CNPJ',
      dataIndex: 'cpfCnpj',
      responsive: ['lg'],
    },
    {
      title: 'Cidade/UF',
      render: (_: unknown, record) => `${record.city}/${record.state}`,
      responsive: ['md'],
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
      responsive: ['lg'],
    },
    {
      title: 'Ações',
      width: 140,
      render: (_: unknown, record) => (
        <Space size="small">
          <Tooltip title="Ver detalhes">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/associados/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/associados/${record.id}/editar`)} />
          </Tooltip>
          <Popconfirm title="Remover associado?" description="Esta ação não pode ser desfeita." onConfirm={() => handleDelete(record.id)} okText="Remover" cancelText="Cancelar">
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
          <UserOutlined style={{ marginRight: 8 }} />
          Gestão de Associados
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/associados/novo')}>
          Novo Associado
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="Buscar por nome, email ou CPF..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{ value: 'todos', label: 'Todos os status' }, { value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'suspenso', label: 'Suspenso' }, { value: 'cancelado', label: 'Cancelado' }]} />
          <Select value={planFilter} onChange={setPlanFilter} style={{ width: 160 }} options={[{ value: 'todos', label: 'Todos os planos' }, { value: 'basico', label: 'Básico' }, { value: 'intermediario', label: 'Intermediário' }, { value: 'avancado', label: 'Avançado' }]} />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} associados` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
