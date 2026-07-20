import { useState } from 'react';
import { Card, Typography, Button, Table, Tag, Row, Col, Statistic, Modal, Form, Input, Select, Checkbox, Space, message, Tooltip } from 'antd';
import {
  SendOutlined, MailOutlined, BellOutlined, PlusOutlined, TeamOutlined,
  EyeOutlined, DeleteOutlined,
  FileTextOutlined, MobileOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';
import { planLabels, planColors } from '../../constants';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Campaign {
  id: string;
  title: string;
  message: string;
  channel: 'in-app' | 'email' | 'push' | 'todos';
  targetPlans: PlanType[];
  targetStatus: string;
  sentTo: number;
  openRate: number;
  status: 'rascunho' | 'enviada' | 'agendada';
  createdAt: string;
  sentAt: string | null;
}

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const initialCampaigns: Campaign[] = [
  {
    id: 'CAMP-001',
    title: 'Bem-vindo à DigitaisBR!',
    message: 'Olá! Sua conta foi ativada com sucesso. Explore seus benefícios e configure sua loja virtual.',
    channel: 'todos',
    targetPlans: ['basico', 'intermediario', 'avancado'],
    targetStatus: 'todos',
    sentTo: 30,
    openRate: 87,
    status: 'enviada',
    createdAt: '2025-05-01T10:00:00Z',
    sentAt: '2025-05-01T10:05:00Z',
  },
  {
    id: 'CAMP-002',
    title: 'Novos produtos no catálogo!',
    message: 'Adicionamos 5 novos produtos exclusivos à prateleira. Confira e adicione à sua loja.',
    channel: 'email',
    targetPlans: ['intermediario', 'avancado'],
    targetStatus: 'ativos',
    sentTo: 18,
    openRate: 72,
    status: 'enviada',
    createdAt: '2025-05-15T14:00:00Z',
    sentAt: '2025-05-15T14:30:00Z',
  },
  {
    id: 'CAMP-003',
    title: 'Promoção: Upgrade com 20% OFF',
    message: 'Faça upgrade do seu plano até sexta-feira e ganhe 20% de desconto nos primeiros 3 meses!',
    channel: 'in-app',
    targetPlans: ['basico'],
    targetStatus: 'ativos',
    sentTo: 10,
    openRate: 65,
    status: 'enviada',
    createdAt: '2025-06-01T09:00:00Z',
    sentAt: '2025-06-01T09:00:00Z',
  },
  {
    id: 'CAMP-004',
    title: 'Webinar: Como vender mais na sua loja',
    message: 'Participe do nosso webinar gratuito sobre estratégias de vendas para criadores digitais. Quinta-feira às 19h.',
    channel: 'todos',
    targetPlans: ['basico', 'intermediario', 'avancado'],
    targetStatus: 'todos',
    sentTo: 0,
    openRate: 0,
    status: 'agendada',
    createdAt: '2025-06-20T16:00:00Z',
    sentAt: null,
  },
  {
    id: 'CAMP-005',
    title: 'Lembrete: Comissões pendentes de saque',
    message: 'Você tem comissões aprovadas disponíveis para saque. Acesse o painel financeiro para solicitar.',
    channel: 'push',
    targetPlans: ['basico', 'intermediario', 'avancado'],
    targetStatus: 'ativos',
    sentTo: 0,
    openRate: 0,
    status: 'rascunho',
    createdAt: '2025-06-25T11:00:00Z',
    sentAt: null,
  },
];

const channelConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  'in-app': { color: 'blue', label: 'In-App', icon: <MobileOutlined /> },
  email: { color: 'green', label: 'Email', icon: <MailOutlined /> },
  push: { color: 'orange', label: 'Push', icon: <BellOutlined /> },
  todos: { color: 'purple', label: 'Todos', icon: <SendOutlined /> },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  rascunho: { color: 'default', label: 'Rascunho' },
  enviada: { color: 'green', label: 'Enviada' },
  agendada: { color: 'blue', label: 'Agendada' },
};

export default function ComunicacoesPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState<Campaign | null>(null);
  const [form] = Form.useForm();

  const totalEnviadas = campaigns.filter((c) => c.status === 'enviada').length;
  const totalDestinatarios = campaigns.reduce((s, c) => s + c.sentTo, 0);
  const avgOpenRate = (() => {
    const sent = campaigns.filter((c) => c.status === 'enviada' && c.openRate > 0);
    if (sent.length === 0) return 0;
    return Math.round(sent.reduce((s, c) => s + c.openRate, 0) / sent.length);
  })();

  const handleSend = (campaign: Campaign) => {
    const targetAssociados = associados.filter((a) => {
      if (campaign.targetStatus === 'ativos' && a.status !== 'ativo') return false;
      if (campaign.targetPlans.length > 0 && !campaign.targetPlans.includes(a.planType as PlanType)) return false;
      return true;
    });

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? { ...c, status: 'enviada' as const, sentTo: targetAssociados.length, sentAt: new Date().toISOString(), openRate: Math.floor(seededRandom(Date.now()) * 30) + 50 }
          : c
      )
    );
    message.success(`Comunicação enviada para ${targetAssociados.length} associado(s)!`);
  };

  const handleCreate = (values: { title: string; message: string; channel: string; targetPlans: PlanType[]; targetStatus: string; action: string }) => {
    const newCampaign: Campaign = {
      id: `CAMP-${String(campaigns.length + 1).padStart(3, '0')}`,
      title: values.title,
      message: values.message,
      channel: values.channel as Campaign['channel'],
      targetPlans: values.targetPlans || [],
      targetStatus: values.targetStatus || 'todos',
      sentTo: 0,
      openRate: 0,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      sentAt: null,
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    if (values.action === 'send') {
      setTimeout(() => handleSend(newCampaign), 300);
    } else {
      message.success('Rascunho salvo!');
    }

    setFormOpen(false);
    form.resetFields();
  };

  const selectedPlans = Form.useWatch('targetPlans', form) || [];
  const selectedStatus = Form.useWatch('targetStatus', form) || 'todos';
  const estimatedRecipients = associados.filter((a) => {
    if (selectedStatus === 'ativos' && a.status !== 'ativo') return false;
    if (selectedPlans.length > 0 && !selectedPlans.includes(a.planType as PlanType)) return false;
    return true;
  }).length;

  const columns = [
    {
      title: 'Campanha',
      key: 'title',
      render: (_: unknown, r: Campaign) => (
        <div style={{ cursor: 'pointer' }} onClick={() => setPreviewOpen(r)}>
          <Text strong style={{ color: '#1677ff' }}>{r.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{r.message.length > 60 ? r.message.slice(0, 60) + '...' : r.message}</Text>
        </div>
      ),
    },
    {
      title: 'Canal',
      dataIndex: 'channel',
      key: 'channel',
      width: 100,
      render: (v: string) => {
        const ch = channelConfig[v];
        return <Tag color={ch.color} icon={ch.icon}>{ch.label}</Tag>;
      },
    },
    {
      title: 'Público',
      key: 'target',
      width: 180,
      render: (_: unknown, r: Campaign) => (
        <Space size={2} wrap>
          {r.targetPlans.length === 3 ? (
            <Tag>Todos os planos</Tag>
          ) : (
            r.targetPlans.map((p) => <Tag key={p} color={planColors[p]} style={{ fontSize: 10 }}>{planLabels[p]}</Tag>)
          )}
        </Space>
      ),
    },
    {
      title: 'Enviados',
      dataIndex: 'sentTo',
      key: 'sentTo',
      width: 90,
      render: (v: number) => v > 0 ? <Text>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Abertura',
      dataIndex: 'openRate',
      key: 'openRate',
      width: 90,
      render: (v: number) => v > 0 ? <Tag color={v > 70 ? 'green' : v > 50 ? 'orange' : 'red'}>{v}%</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Data',
      key: 'date',
      width: 100,
      render: (_: unknown, r: Campaign) => new Date(r.sentAt || r.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, r: Campaign) => (
        <Space>
          <Tooltip title="Visualizar">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setPreviewOpen(r)} />
          </Tooltip>
          {(r.status === 'rascunho' || r.status === 'agendada') && (
            <Tooltip title="Enviar agora">
              <Button type="text" size="small" icon={<SendOutlined />} style={{ color: '#52c41a' }} onClick={() => handleSend(r)} />
            </Tooltip>
          )}
          {r.status === 'rascunho' && (
            <Tooltip title="Excluir">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => { setCampaigns((p) => p.filter((c) => c.id !== r.id)); message.success('Excluído'); }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <SendOutlined style={{ marginRight: 8 }} />
          Comunicações
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Nova Comunicação</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Campanhas Enviadas" value={totalEnviadas} prefix={<SendOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Total de Envios" value={totalDestinatarios} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Taxa de Abertura" value={avgOpenRate} suffix="%" prefix={<EyeOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Rascunhos" value={campaigns.filter((c) => c.status === 'rascunho').length} prefix={<FileTextOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={campaigns}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `${t} comunicações` }}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Nova Comunicação */}
      <Modal
        title="Nova Comunicação"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={(values) => handleCreate({ ...values, action: 'draft' })} initialValues={{ targetPlans: ['basico', 'intermediario', 'avancado'], targetStatus: 'todos', channel: 'todos' }}>
          <Form.Item name="title" label="Título da comunicação" rules={[{ required: true, message: 'Informe o título' }]}>
            <Input placeholder="Ex: Novos produtos disponíveis!" />
          </Form.Item>

          <Form.Item name="message" label="Mensagem" rules={[{ required: true, message: 'Escreva a mensagem' }]}>
            <TextArea rows={4} placeholder="Escreva a mensagem que será enviada aos associados..." showCount maxLength={500} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="channel" label="Canal de envio">
                <Select>
                  <Select.Option value="todos"><SendOutlined /> Todos os canais</Select.Option>
                  <Select.Option value="in-app"><MobileOutlined /> In-App</Select.Option>
                  <Select.Option value="email"><MailOutlined /> Email</Select.Option>
                  <Select.Option value="push"><BellOutlined /> Push</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetStatus" label="Status dos associados">
                <Select>
                  <Select.Option value="todos">Todos</Select.Option>
                  <Select.Option value="ativos">Apenas ativos</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="targetPlans" label="Planos alvo">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={8}><Checkbox value="basico"><Tag color="blue">Básico</Tag></Checkbox></Col>
                <Col span={8}><Checkbox value="intermediario"><Tag color="purple">Intermediário</Tag></Checkbox></Col>
                <Col span={8}><Checkbox value="avancado"><Tag color="gold">Avançado</Tag></Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TeamOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              <div>
                <Text strong style={{ color: '#52c41a' }}>Estimativa: {estimatedRecipients} destinatário(s)</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>Com base nos filtros selecionados</Text>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setFormOpen(false); form.resetFields(); }}>Cancelar</Button>
            <Button icon={<FileTextOutlined />} onClick={() => { form.validateFields().then((v) => handleCreate({ ...v, action: 'draft' })); }}>Salvar Rascunho</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => { form.validateFields().then((v) => handleCreate({ ...v, action: 'send' })); }}>Enviar Agora</Button>
          </div>
        </Form>
      </Modal>

      {/* Preview */}
      <Modal
        title={null}
        open={!!previewOpen}
        onCancel={() => setPreviewOpen(null)}
        footer={
          previewOpen && (previewOpen.status === 'rascunho' || previewOpen.status === 'agendada') ? (
            <Button type="primary" icon={<SendOutlined />} onClick={() => { handleSend(previewOpen); setPreviewOpen(null); }}>
              Enviar Agora
            </Button>
          ) : null
        }
        width={500}
      >
        {previewOpen && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Tag color={statusConfig[previewOpen.status].color} style={{ fontSize: 12 }}>{statusConfig[previewOpen.status].label}</Tag>
            </div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 4 }}>{previewOpen.title}</Title>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {(() => {
                const ch = channelConfig[previewOpen.channel];
                return <Tag color={ch.color} icon={ch.icon}>{ch.label}</Tag>;
              })()}
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                {new Date(previewOpen.sentAt || previewOpen.createdAt).toLocaleString('pt-BR')}
              </Text>
            </div>
            <Card style={{ background: '#fafafa', borderRadius: 12, marginBottom: 16 }}>
              <Paragraph style={{ fontSize: 14, margin: 0 }}>{previewOpen.message}</Paragraph>
            </Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Público" value={previewOpen.targetPlans.length === 3 ? 'Todos' : previewOpen.targetPlans.map((p) => planLabels[p]).join(', ')} styles={{ content: { fontSize: 14 } }} />
              </Col>
              <Col span={8}>
                <Statistic title="Enviados" value={previewOpen.sentTo} styles={{ content: { fontSize: 14 } }} />
              </Col>
              <Col span={8}>
                <Statistic title="Abertura" value={previewOpen.openRate > 0 ? `${previewOpen.openRate}%` : '—'} styles={{ content: { fontSize: 14, color: '#52c41a' } }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
