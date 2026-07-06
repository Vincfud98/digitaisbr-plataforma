import { useState, useMemo } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Rate, message, Modal, Form, DatePicker, Segmented, Badge, Popconfirm } from 'antd';
import { AuditOutlined, SearchOutlined, PlusOutlined, CalendarOutlined, FileTextOutlined, BankOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addServiceRequest, updateServiceStatus } from '../../store/slices/servicosSlice';
import type { ServiceRequest, ServiceRequestStatus, ServiceType } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<ServiceRequestStatus, { color: string; label: string }> = {
  aberto: { color: 'blue', label: 'Aberto' },
  'em-andamento': { color: 'orange', label: 'Em Andamento' },
  concluido: { color: 'green', label: 'Concluído' },
  cancelado: { color: 'default', label: 'Cancelado' },
};

const typeConfig: Record<ServiceType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  juridico: { color: 'blue', hex: '#1677ff', label: 'Jurídico', icon: <AuditOutlined /> },
  contabil: { color: 'green', hex: '#52c41a', label: 'Contábil', icon: <BankOutlined /> },
};

export default function ServicosPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.servicos.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [view, setView] = useState<string>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.associadoName.toLowerCase().includes(search.toLowerCase()) && !r.professionalName.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (view === 'abertos' && r.status !== 'aberto') return false;
      if (view === 'andamento' && r.status !== 'em-andamento') return false;
      if (view === 'concluidos' && r.status !== 'concluido') return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const d = new Date(r.createdAt);
        if (d < dateRange[0].toDate() || d > dateRange[1].toDate()) return false;
      }
      return true;
    });
  }, [requests, search, typeFilter, statusFilter, view, dateRange]);

  const totalAberto = requests.filter((r) => r.status === 'aberto').length;
  const totalAndamento = requests.filter((r) => r.status === 'em-andamento').length;
  const totalConcluido = requests.filter((r) => r.status === 'concluido').length;
  const totalCancelado = requests.filter((r) => r.status === 'cancelado').length;
  const avgRating = useMemo(() => {
    const rated = requests.filter((r) => r.rating !== null);
    return rated.length > 0 ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length : 0;
  }, [requests]);

  const profSummary = useMemo(() => {
    const map = new Map<string, { count: number; completed: number; totalRating: number; ratedCount: number }>();
    requests.forEach((r) => {
      if (!r.professionalName) return;
      const entry = map.get(r.professionalName) || { count: 0, completed: 0, totalRating: 0, ratedCount: 0 };
      entry.count++;
      if (r.status === 'concluido') entry.completed++;
      if (r.rating) { entry.totalRating += r.rating; entry.ratedCount++; }
      map.set(r.professionalName, entry);
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data, avgRating: data.ratedCount > 0 ? data.totalRating / data.ratedCount : 0 })).sort((a, b) => b.count - a.count);
  }, [requests]);

  const handleCreate = (values: { title: string; type: ServiceType; associadoId: string; professionalName?: string; scheduledAt?: any; description: string }) => {
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
  };

  const ServiceCard = ({ r }: { r: ServiceRequest }) => {
    const tc = typeConfig[r.type];
    const sc = statusConfig[r.status];
    return (
      <div
        style={{
          padding: 16,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: r.status === 'aberto' ? '#f0f5ff' : '#fff',
          borderLeft: `3px solid ${tc.hex}`,
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <Tag style={{ margin: 0, fontFamily: 'monospace', fontSize: 11 }}>{r.id.toUpperCase()}</Tag>
              <Tag color={tc.color} icon={tc.icon} style={{ margin: 0 }}>{tc.label}</Tag>
              <Tag color={sc.color} style={{ margin: 0 }}>{sc.label}</Tag>
            </div>
            <Text strong style={{ fontSize: 14 }}>{r.title}</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <UserOutlined style={{ marginRight: 4 }} />{r.associadoName}
              </Text>
            </div>
            {r.description && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                {r.description.length > 100 ? r.description.substring(0, 100) + '...' : r.description}
              </Text>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {r.status === 'aberto' && (
              <Popconfirm title="Iniciar atendimento?" okText="Sim" cancelText="Não" onConfirm={() => { dispatch(updateServiceStatus({ id: r.id, status: 'em-andamento' })); message.success('Em andamento!'); }}>
                <Button type="primary" size="small" icon={<ClockCircleOutlined />}>Iniciar</Button>
              </Popconfirm>
            )}
            {r.status === 'em-andamento' && (
              <Popconfirm title="Marcar como concluído?" okText="Sim" cancelText="Não" onConfirm={() => { dispatch(updateServiceStatus({ id: r.id, status: 'concluido' })); message.success('Concluído!'); }}>
                <Button type="primary" size="small" style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />}>Concluir</Button>
              </Popconfirm>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
          <Space size={4} style={{ fontSize: 12, color: '#888' }}>
            <AuditOutlined />
            <span>{r.professionalName || 'Sem profissional'}</span>
          </Space>
          <Space size={4} style={{ fontSize: 12, color: '#888' }}>
            <CalendarOutlined />
            <span>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString('pt-BR') : 'Sem agenda'}</span>
          </Space>
          {r.documents.length > 0 && (
            <Space size={4} style={{ fontSize: 12, color: '#888' }}>
              <FileTextOutlined />
              <span>{r.documents.length} doc{r.documents.length > 1 ? 's' : ''}</span>
            </Space>
          )}
          {r.rating && (
            <Rate disabled defaultValue={r.rating} style={{ fontSize: 12 }} />
          )}
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>
            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <AuditOutlined style={{ marginRight: 8 }} />
          Serviços Jurídico e Contábil
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Nova Solicitação</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Em Aberto" value={totalAberto} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #fa8c16' }}>
            <Statistic title="Em Andamento" value={totalAndamento} styles={{ content: { color: '#fa8c16', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Concluídos" value={totalConcluido} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #ff4d4f' }}>
            <Statistic title="Cancelados" value={totalCancelado} styles={{ content: { color: '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Avaliação Média" value={avgRating} precision={1} suffix="/5" styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #888' }}>
            <Statistic title="Total" value={requests.length} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<><StarOutlined style={{ marginRight: 8, color: '#faad14' }} />Profissionais</>} size="small">
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {profSummary.map((p) => (
                <div key={p.name} style={{ minWidth: 180, padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0', flexShrink: 0 }}>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                    <Text type="secondary">{p.count} serviços</Text>
                    <Text style={{ color: '#52c41a' }}>{p.completed} concluído{p.completed !== 1 ? 's' : ''}</Text>
                  </div>
                  {p.avgRating > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <Rate disabled defaultValue={p.avgRating} style={{ fontSize: 11 }} />
                    </div>
                  )}
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
              { label: `Todos (${requests.length})`, value: 'todos' },
              { label: <Badge count={totalAberto} size="small" offset={[8, -2]}><span>Abertos</span></Badge>, value: 'abertos' },
              { label: `Andamento (${totalAndamento})`, value: 'andamento' },
              { label: `Concluídos (${totalConcluido})`, value: 'concluidos' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar solicitação, associado ou profissional..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            <Select.Option value="juridico">Jurídico</Select.Option>
            <Select.Option value="contabil">Contábil</Select.Option>
          </Select>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }} disabled={view !== 'todos'}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="aberto">Aberto</Select.Option>
            <Select.Option value="em-andamento">Em Andamento</Select.Option>
            <Select.Option value="concluido">Concluído</Select.Option>
            <Select.Option value="cancelado">Cancelado</Select.Option>
          </Select>
          <RangePicker format="DD/MM/YYYY" placeholder={['Data início', 'Data fim']} onChange={(dates) => setDateRange(dates as [any, any] | null)} style={{ width: 240 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <AuditOutlined style={{ fontSize: 40, marginBottom: 12 }} />
              <div>Nenhuma solicitação encontrada</div>
            </div>
          ) : (
            filtered.map((r) => <ServiceCard key={r.id} r={r} />)
          )}
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>
            {filtered.length} solicitaç{filtered.length !== 1 ? 'ões' : 'ão'}
          </div>
        )}
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
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input placeholder="Ex: Revisão de contrato social" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="juridico"><AuditOutlined style={{ marginRight: 6 }} />Jurídico</Select.Option>
                  <Select.Option value="contabil"><BankOutlined style={{ marginRight: 6 }} />Contábil</Select.Option>
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
            <Col span={12}><Form.Item name="scheduledAt" label="Agendamento"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Descreva a solicitação..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
