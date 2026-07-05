import { useState, useRef, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, message, Modal, Form, Avatar, Tooltip, Dropdown } from 'antd';
import {
  CustomerServiceOutlined, SearchOutlined, PlusOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, SendOutlined, UserOutlined,
  TeamOutlined, RobotOutlined, TagOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTicket, updateTicketStatus, assignTicket, addMessage } from '../../store/slices/suporteSlice';
import type { SupportTicket, TicketStatus, TicketPriority, PlanType, TicketMessage } from '../../types';

const { Title, Text } = Typography;

const statusConfig: Record<TicketStatus, { color: string; label: string }> = {
  aberto: { color: 'blue', label: 'Aberto' },
  'em-andamento': { color: 'orange', label: 'Em Andamento' },
  resolvido: { color: 'green', label: 'Resolvido' },
  fechado: { color: 'default', label: 'Fechado' },
};

const priorityConfig: Record<TicketPriority, { color: string; label: string }> = {
  baixa: { color: 'default', label: 'Baixa' },
  media: { color: 'blue', label: 'Média' },
  alta: { color: 'orange', label: 'Alta' },
  urgente: { color: 'red', label: 'Urgente' },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico' },
  intermediario: { color: 'purple', label: 'Intermediário' },
  avancado: { color: 'gold', label: 'Avançado' },
};

function ChatModal({ ticket, open, onClose }: { ticket: SupportTicket | null; open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const allMessages = useAppSelector((s) => s.suporte.messages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticketMessages = ticket ? allMessages.filter((m) => m.ticketId === ticket.id) : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, ticketMessages.length]);

  const handleSend = () => {
    if (!inputValue.trim() || !ticket) return;
    const msg: TicketMessage = {
      id: `MSG-${ticket.id}-${Date.now()}`,
      ticketId: ticket.id,
      sender: 'agent',
      senderName: user?.name || 'Admin',
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch(addMessage(msg));
    if (ticket.status === 'aberto') {
      dispatch(updateTicketStatus({ id: ticket.id, status: 'em-andamento' }));
      if (!ticket.assignedTo) {
        dispatch(assignTicket({ id: ticket.id, assignedTo: user?.name || 'Admin' }));
      }
    }
    setInputValue('');
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!ticket) return;
    dispatch(updateTicketStatus({ id: ticket.id, status }));
    const labels: Record<TicketStatus, string> = { aberto: 'Reaberto', 'em-andamento': 'Em andamento', resolvido: 'Resolvido', fechado: 'Fechado' };
    const sysMsg: TicketMessage = {
      id: `MSG-${ticket.id}-sys-${Date.now()}`,
      ticketId: ticket.id,
      sender: 'system',
      senderName: 'Sistema',
      content: `Status alterado para "${labels[status]}" por ${user?.name || 'Admin'}.`,
      createdAt: new Date().toISOString(),
    };
    dispatch(addMessage(sysMsg));
    message.success(`Status: ${labels[status]}`);
  };

  if (!ticket) return null;

  const isClosed = ticket.status === 'resolvido' || ticket.status === 'fechado';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      styles={{ body: { padding: 0 } }}
      title={null}
      closable={false}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Tag style={{ margin: 0 }}>{ticket.id}</Tag>
              <Tag color={priorityConfig[ticket.priority].color}>{priorityConfig[ticket.priority].label}</Tag>
              <Tag color={statusConfig[ticket.status].color}>{statusConfig[ticket.status].label}</Tag>
            </div>
            <Title level={5} style={{ margin: '4px 0 2px' }}>{ticket.subject}</Title>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <UserOutlined /> {ticket.userName}
              </Text>
              <Tag color={planConfig[ticket.userPlan].color} style={{ fontSize: 10 }}>{planConfig[ticket.userPlan].label}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>· {ticket.category}</Text>
              {ticket.assignedTo && (
                <Text type="secondary" style={{ fontSize: 12 }}>· <TeamOutlined /> {ticket.assignedTo}</Text>
              )}
            </Space>
          </div>
          <Space>
            <Dropdown menu={{
              items: [
                { key: 'em-andamento', label: 'Em Andamento', disabled: ticket.status === 'em-andamento' },
                { key: 'resolvido', label: 'Resolver', disabled: ticket.status === 'resolvido' },
                { key: 'fechado', label: 'Fechar', disabled: ticket.status === 'fechado' },
                { key: 'aberto', label: 'Reabrir', disabled: ticket.status === 'aberto' },
              ],
              onClick: ({ key }) => handleStatusChange(key as TicketStatus),
            }}>
              <Button icon={<TagOutlined />} size="small">Status</Button>
            </Dropdown>
            <Button onClick={onClose} size="small">Fechar</Button>
          </Space>
        </div>
      </div>

      {/* Messages */}
      <div style={{ height: 420, overflowY: 'auto', padding: '16px 20px', background: '#f5f7fa' }}>
        {ticketMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <CustomerServiceOutlined style={{ fontSize: 40, marginBottom: 8 }} />
            <br />
            <Text type="secondary">Nenhuma mensagem ainda. Envie a primeira resposta.</Text>
          </div>
        ) : (
          ticketMessages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} style={{ textAlign: 'center', margin: '12px 0' }}>
                  <Tag style={{ background: '#e6f4ff', border: 'none', color: '#1677ff', fontSize: 11 }}>
                    <RobotOutlined /> {msg.content}
                  </Tag>
                  <div><Text type="secondary" style={{ fontSize: 10 }}>{new Date(msg.createdAt).toLocaleString('pt-BR')}</Text></div>
                </div>
              );
            }

            const isAgent = msg.sender === 'agent';
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, maxWidth: '75%', flexDirection: isAgent ? 'row-reverse' : 'row' }}>
                  <Avatar
                    size={32}
                    style={{ background: isAgent ? '#1677ff' : '#722ed1', flexShrink: 0 }}
                    icon={isAgent ? <TeamOutlined /> : <UserOutlined />}
                  />
                  <div>
                    <div style={{ textAlign: isAgent ? 'right' : 'left', marginBottom: 2 }}>
                      <Text strong style={{ fontSize: 12 }}>{msg.senderName}</Text>
                      <Text type="secondary" style={{ fontSize: 10, marginLeft: 8 }}>
                        {new Date(msg.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                    <div style={{
                      background: isAgent ? '#1677ff' : '#fff',
                      color: isAgent ? '#fff' : '#333',
                      padding: '10px 14px',
                      borderRadius: isAgent ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      fontSize: 14,
                      lineHeight: '1.5',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        {isClosed ? (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <Text type="secondary">Ticket {ticket.status === 'resolvido' ? 'resolvido' : 'fechado'}.</Text>
            <Button type="link" size="small" onClick={() => handleStatusChange('aberto')}>Reabrir ticket</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua resposta..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              style={{ borderRadius: 20, paddingLeft: 16 }}
            />
            <Tooltip title="Enviar (Enter)">
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{ alignSelf: 'flex-end' }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function SuportePage() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector((s) => s.suporte.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [chatTicket, setChatTicket] = useState<SupportTicket | null>(null);
  const [form] = Form.useForm();

  const filtered = tickets.filter((t) => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.userName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const totalAberto = tickets.filter((t) => t.status === 'aberto').length;
  const totalAndamento = tickets.filter((t) => t.status === 'em-andamento').length;
  const totalResolvido = tickets.filter((t) => t.status === 'resolvido' || t.status === 'fechado').length;
  const avgResolution = (() => {
    const resolved = tickets.filter((t) => t.resolvedAt);
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const resolvedAt = new Date(t.resolvedAt!).getTime();
      return sum + (resolvedAt - created) / 3600000;
    }, 0);
    return Math.round(totalHours / resolved.length);
  })();

  const openChat = (ticket: SupportTicket) => {
    setChatTicket(ticket);
  };

  const columns = [
    {
      title: 'Ticket',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Assunto',
      key: 'subject',
      render: (_: unknown, r: SupportTicket) => (
        <div style={{ cursor: 'pointer' }} onClick={() => openChat(r)}>
          <Text strong style={{ color: '#1677ff' }}>{r.subject}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.userName} · <Tag color={planConfig[r.userPlan].color} style={{ fontSize: 10 }}>{planConfig[r.userPlan].label}</Tag></Text>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (v: TicketPriority) => <Tag color={priorityConfig[v].color}>{priorityConfig[v].label}</Tag>,
    },
    {
      title: 'Msgs',
      dataIndex: 'messages',
      key: 'messages',
      width: 60,
      render: (v: number) => v,
    },
    {
      title: 'Atribuído',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 150,
      render: (v: string | null) => v || <Text type="secondary">-</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: TicketStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: SupportTicket) => (
        <Button type="link" size="small" onClick={() => openChat(r)}>
          {r.status === 'aberto' ? 'Atender' : 'Abrir'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CustomerServiceOutlined style={{ marginRight: 8 }} />
          Suporte e Atendimento
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Ticket</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Em Aberto" value={totalAberto} prefix={<ExclamationCircleOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Em Andamento" value={totalAndamento} prefix={<ClockCircleOutlined />} styles={{ content: { color: '#fa8c16' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Resolvidos" value={totalResolvido} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Tempo Médio (h)" value={avgResolution} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar ticket..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="aberto">Aberto</Select.Option>
            <Select.Option value="em-andamento">Em Andamento</Select.Option>
            <Select.Option value="resolvido">Resolvido</Select.Option>
            <Select.Option value="fechado">Fechado</Select.Option>
          </Select>
          <Select value={priorityFilter} onChange={setPriorityFilter} style={{ width: 140 }}>
            <Select.Option value="all">Prioridades</Select.Option>
            <Select.Option value="baixa">Baixa</Select.Option>
            <Select.Option value="media">Média</Select.Option>
            <Select.Option value="alta">Alta</Select.Option>
            <Select.Option value="urgente">Urgente</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} tickets` }}
          size="middle"
          onRow={(record) => ({ onClick: () => openChat(record), style: { cursor: 'pointer' } })}
        />
      </Card>

      <ChatModal ticket={chatTicket} open={!!chatTicket} onClose={() => setChatTicket(null)} />

      <Modal
        title="Novo Ticket de Suporte"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Abrir Ticket"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const ticket: SupportTicket = {
            id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
            subject: values.subject,
            description: values.description,
            category: values.category,
            priority: values.priority,
            status: 'aberto',
            userId: user?.id || 'admin',
            userName: user?.name || 'Admin',
            userPlan: (user?.plan as PlanType) || 'basico',
            assignedTo: null,
            messages: 1,
            rating: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
          };
          dispatch(addTicket(ticket));
          message.success('Ticket aberto!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="subject" label="Assunto" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="Financeiro">Financeiro</Select.Option>
                  <Select.Option value="Técnico">Técnico</Select.Option>
                  <Select.Option value="Comercial">Comercial</Select.Option>
                  <Select.Option value="Conta">Conta</Select.Option>
                  <Select.Option value="Outros">Outros</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Prioridade" rules={[{ required: true }]} initialValue="media">
                <Select>
                  <Select.Option value="baixa">Baixa</Select.Option>
                  <Select.Option value="media">Média</Select.Option>
                  <Select.Option value="alta">Alta</Select.Option>
                  <Select.Option value="urgente">Urgente</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
