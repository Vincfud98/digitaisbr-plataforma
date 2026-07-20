import { useState, useRef, useEffect } from 'react';
import { Card, Typography, Tag, Button, Input, Space, Empty, Modal, Form, Select, Avatar, Tooltip, message } from 'antd';
import {
  CustomerServiceOutlined, PlusOutlined, SendOutlined, UserOutlined,
  TeamOutlined, RobotOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTicket, addMessage } from '../../store/slices/suporteSlice';
import type { SupportTicket, TicketMessage, PlanType, TicketStatus } from '../../types';

const { Title, Text } = Typography;

const statusConfig: Record<TicketStatus, { color: string; label: string; icon: React.ReactNode }> = {
  aberto: { color: 'blue', label: 'Aberto', icon: <ExclamationCircleOutlined /> },
  'em-andamento': { color: 'orange', label: 'Em Andamento', icon: <ClockCircleOutlined /> },
  resolvido: { color: 'green', label: 'Resolvido', icon: <CheckCircleOutlined /> },
  fechado: { color: 'default', label: 'Fechado', icon: <CheckCircleOutlined /> },
};

export default function PortalSuportePage() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector((s) => s.suporte.list);
  const allMessages = useAppSelector((s) => s.suporte.messages);
  const { user } = useAppSelector((s) => s.auth);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [form] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const meusTickets = tickets.filter((t) => t.userId === (user?.id || 'assoc-1'));
  const ticketMessages = selectedTicket ? allMessages.filter((m) => m.ticketId === selectedTicket.id) : [];

  useEffect(() => {
    if (selectedTicket) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selectedTicket, ticketMessages.length]);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedTicket) return;
    const msg: TicketMessage = {
      id: `MSG-${selectedTicket.id}-${Date.now()}`,
      ticketId: selectedTicket.id,
      sender: 'user',
      senderName: user?.name || 'Associado',
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch(addMessage(msg));
    setInputValue('');
  };

  const abertos = meusTickets.filter((t) => t.status === 'aberto' || t.status === 'em-andamento').length;
  const resolvidos = meusTickets.filter((t) => t.status === 'resolvido' || t.status === 'fechado').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CustomerServiceOutlined style={{ marginRight: 8 }} />
          Meus Chamados
        </Title>
        <Space>
          <Tag color="blue">{abertos} aberto(s)</Tag>
          <Tag color="green">{resolvidos} resolvido(s)</Tag>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Chamado</Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 220px)', minHeight: 500 }}>
        {/* Lista de tickets */}
        <Card style={{ width: 340, flexShrink: 0, overflow: 'auto' }} styles={{ body: { padding: 0 } }}>
          {meusTickets.length === 0 ? (
            <Empty description="Nenhum chamado" style={{ padding: 40 }} />
          ) : (
            meusTickets.map((t) => {
              const sc = statusConfig[t.status];
              const isActive = selectedTicket?.id === t.id;
              const tMsgs = allMessages.filter((m) => m.ticketId === t.id);
              const lastMsg = tMsgs[tMsgs.length - 1];
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    background: isActive ? '#e6f4ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{t.subject}</Text>
                    <Tag color={sc.color} style={{ fontSize: 10, margin: 0 }}>{sc.label}</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                    {t.category} · {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                  {lastMsg && (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                      {lastMsg.senderName}: {lastMsg.content.length > 50 ? lastMsg.content.slice(0, 50) + '...' : lastMsg.content}
                    </Text>
                  )}
                </div>
              );
            })
          )}
        </Card>

        {/* Chat */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }} styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}>
          {!selectedTicket ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description="Selecione um chamado ou abra um novo" />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Tag style={{ margin: 0, fontSize: 10 }}>{selectedTicket.id}</Tag>
                      <Tag color={statusConfig[selectedTicket.status].color} style={{ margin: 0, fontSize: 10 }}>{statusConfig[selectedTicket.status].label}</Tag>
                    </div>
                    <Text strong>{selectedTicket.subject}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {selectedTicket.category} · {selectedTicket.assignedTo ? `Atendente: ${selectedTicket.assignedTo}` : 'Aguardando atendimento'}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#e8ecf1' }}>
                {ticketMessages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} style={{ textAlign: 'center', margin: '16px 0' }}>
                        <Tag style={{ background: '#d6e4ff', border: '1px solid #adc6ff', color: '#1d39c4', fontSize: 11, padding: '2px 10px' }}>
                          <RobotOutlined /> {msg.content}
                        </Tag>
                        <div style={{ marginTop: 4 }}><Text type="secondary" style={{ fontSize: 10 }}>{new Date(msg.createdAt).toLocaleString('pt-BR')}</Text></div>
                      </div>
                    );
                  }
                  const isMe = msg.sender === 'user';
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 10, maxWidth: '75%', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <Avatar size={34} style={{ background: isMe ? '#722ed1' : '#1677ff', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }} icon={isMe ? <UserOutlined /> : <TeamOutlined />} />
                        <div>
                          <div style={{ textAlign: isMe ? 'right' : 'left', marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 12, color: isMe ? '#531dab' : '#1d39c4' }}>{msg.senderName}</Text>
                            <Text type="secondary" style={{ fontSize: 10, marginLeft: 8 }}>
                              {new Date(msg.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </div>
                          <div style={{
                            background: isMe ? '#722ed1' : '#ffffff',
                            color: isMe ? '#fff' : '#262626',
                            padding: '12px 16px',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            boxShadow: isMe ? '0 2px 8px rgba(114,46,209,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
                            border: isMe ? 'none' : '1px solid #d9d9d9',
                            fontSize: 14, lineHeight: '1.6',
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
                {selectedTicket.status === 'resolvido' || selectedTicket.status === 'fechado' ? (
                  <div style={{ textAlign: 'center', padding: 4 }}>
                    <Text type="secondary">Chamado {selectedTicket.status}.</Text>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input.TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      style={{ borderRadius: 20, paddingLeft: 16 }}
                    />
                    <Tooltip title="Enviar">
                      <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} disabled={!inputValue.trim()} style={{ alignSelf: 'flex-end' }} />
                    </Tooltip>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Novo chamado modal */}
      <Modal
        title="Novo Chamado"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Abrir Chamado"
        cancelText="Cancelar"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const ticket: SupportTicket = {
            id: `SUP-${String(tickets.length + 1).padStart(3, '0')}`,
            subject: values.subject,
            description: values.description,
            category: values.category,
            priority: values.priority || 'media',
            status: 'aberto',
            userId: user?.id || 'assoc-1',
            userName: user?.name || 'Associado',
            userPlan: (user?.plan as PlanType) || 'basico',
            assignedTo: null,
            messages: 1,
            rating: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
          };
          dispatch(addTicket(ticket));
          const firstMsg: TicketMessage = {
            id: `MSG-${ticket.id}-1`,
            ticketId: ticket.id,
            sender: 'user',
            senderName: user?.name || 'Associado',
            content: values.description,
            createdAt: new Date().toISOString(),
          };
          dispatch(addMessage(firstMsg));
          message.success('Chamado aberto com sucesso!');
          setFormOpen(false);
          form.resetFields();
          setSelectedTicket(ticket);
        }}>
          <Form.Item name="subject" label="Assunto" rules={[{ required: true, message: 'Informe o assunto' }]}>
            <Input placeholder="Resumo do problema ou dúvida" />
          </Form.Item>
          <Form.Item name="category" label="Categoria" rules={[{ required: true, message: 'Selecione a categoria' }]}>
            <Select placeholder="Selecione">
              <Select.Option value="Acesso">Acesso / Login</Select.Option>
              <Select.Option value="Loja Virtual">Minha Loja</Select.Option>
              <Select.Option value="Financeiro">Financeiro / Comissões</Select.Option>
              <Select.Option value="Planos">Plano / Upgrade</Select.Option>
              <Select.Option value="Benefícios">Benefícios</Select.Option>
              <Select.Option value="Catálogo">Catálogo / Produtos</Select.Option>
              <Select.Option value="Outros">Outros</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Prioridade" initialValue="media">
            <Select>
              <Select.Option value="baixa">Baixa</Select.Option>
              <Select.Option value="media">Média</Select.Option>
              <Select.Option value="alta">Alta</Select.Option>
              <Select.Option value="urgente">Urgente</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'Descreva o problema' }]}>
            <Input.TextArea rows={4} placeholder="Descreva o problema ou dúvida em detalhes..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
