import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Rate, message, Modal, Form, DatePicker } from 'antd';
import { AuditOutlined, SearchOutlined, PlusOutlined, CalendarOutlined, FileTextOutlined, BankOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addServiceRequest, updateServiceStatus } from '../../store/slices/servicosSlice';
import type { ServiceRequest, ServiceRequestStatus, ServiceType } from '../../types';

const { Title } = Typography;

const statusConfig: Record<ServiceRequestStatus, { color: string; label: string }> = {
  aberto: { color: 'blue', label: 'Aberto' },
  'em-andamento': { color: 'orange', label: 'Em Andamento' },
  concluido: { color: 'green', label: 'Concluído' },
  cancelado: { color: 'default', label: 'Cancelado' },
};

const typeConfig: Record<ServiceType, { color: string; label: string; icon: React.ReactNode }> = {
  juridico: { color: 'blue', label: 'Jurídico', icon: <AuditOutlined /> },
  contabil: { color: 'green', label: 'Contábil', icon: <BankOutlined /> },
};

export default function ServicosPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.servicos.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = requests.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.associadoName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const totalAberto = requests.filter((r) => r.status === 'aberto').length;
  const totalAndamento = requests.filter((r) => r.status === 'em-andamento').length;
  const totalConcluido = requests.filter((r) => r.status === 'concluido').length;

  const columns = [
    {
      title: 'Protocolo',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (v: string) => <Tag>{v.toUpperCase()}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (v: ServiceType) => <Tag color={typeConfig[v].color} icon={typeConfig[v].icon}>{typeConfig[v].label}</Tag>,
    },
    {
      title: 'Solicitação',
      key: 'title',
      render: (_: unknown, r: ServiceRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.associadoName}</div>
        </div>
      ),
    },
    {
      title: 'Profissional',
      dataIndex: 'professionalName',
      key: 'professionalName',
      width: 180,
    },
    {
      title: 'Agendamento',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 130,
      render: (v: string | null) => v ? (
        <Space><CalendarOutlined /> {new Date(v).toLocaleDateString('pt-BR')}</Space>
      ) : <Tag>Sem agenda</Tag>,
    },
    {
      title: 'Docs',
      dataIndex: 'documents',
      key: 'documents',
      width: 60,
      render: (v: string[]) => v.length > 0 ? <Space><FileTextOutlined /> {v.length}</Space> : '-',
    },
    {
      title: 'Avaliação',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      render: (v: number | null) => v ? <Rate disabled defaultValue={v} style={{ fontSize: 14 }} /> : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: ServiceRequestStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: ServiceRequest) => (
        <Space>
          {r.status === 'aberto' && (
            <Button type="link" size="small" onClick={() => { dispatch(updateServiceStatus({ id: r.id, status: 'em-andamento' })); message.success('Em andamento!'); }}>
              Iniciar
            </Button>
          )}
          {r.status === 'em-andamento' && (
            <Button type="link" size="small" onClick={() => { dispatch(updateServiceStatus({ id: r.id, status: 'concluido' })); message.success('Concluído!'); }}>
              Concluir
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <AuditOutlined style={{ marginRight: 8 }} />
          Serviços Jurídico e Contábil
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Nova Solicitação</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Em Aberto" value={totalAberto} prefix={<AuditOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Em Andamento" value={totalAndamento} prefix={<CalendarOutlined />} styles={{ content: { color: '#fa8c16' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Concluídos" value={totalConcluido} prefix={<AuditOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar solicitação..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            <Select.Option value="juridico">Jurídico</Select.Option>
            <Select.Option value="contabil">Contábil</Select.Option>
          </Select>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="aberto">Aberto</Select.Option>
            <Select.Option value="em-andamento">Em Andamento</Select.Option>
            <Select.Option value="concluido">Concluído</Select.Option>
            <Select.Option value="cancelado">Cancelado</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} solicitações` }}
          size="middle"
        />
      </Card>

      <Modal
        title="Nova Solicitação de Serviço"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Enviar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const assoc = associados.find((a) => a.id === values.associadoId);
          const req: ServiceRequest = {
            id: `srv-${Date.now()}`,
            type: values.type,
            title: values.title,
            description: values.description,
            associadoId: values.associadoId,
            associadoName: assoc?.name || 'Associado',
            professionalName: values.professionalName || '',
            status: 'aberto',
            scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : null,
            documents: [],
            rating: null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addServiceRequest(req));
          message.success('Solicitação criada!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="juridico">Jurídico</Select.Option>
                  <Select.Option value="contabil">Contábil</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="associadoId" label="Associado" rules={[{ required: true }]}>
                <Select placeholder="Selecione" showSearch optionFilterProp="children">
                  {associados.filter((a) => a.status === 'ativo').map((a) => (
                    <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="professionalName" label="Profissional"><Input placeholder="Nome do profissional" /></Form.Item></Col>
            <Col span={12}><Form.Item name="scheduledAt" label="Agendamento"><DatePicker style={{ width: '100%' }} showTime /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
