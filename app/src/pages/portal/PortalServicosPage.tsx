import { useState } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Rate, message, Modal, Form, Tabs, Badge, Empty } from 'antd';
import {
  AuditOutlined, SearchOutlined, PlusOutlined, CalendarOutlined, BankOutlined,
  CheckCircleOutlined, ClockCircleOutlined, UserOutlined, ShopOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, TagOutlined, TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addServiceRequest } from '../../store/slices/servicosSlice';
import type { ServiceRequest, ServiceType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const typeConfig: Record<ServiceType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  juridico: { color: 'blue', hex: '#1677ff', label: 'Jurídico', icon: <AuditOutlined /> },
  contabil: { color: 'green', hex: '#52c41a', label: 'Contábil', icon: <BankOutlined /> },
};

const statusLabels: Record<string, { color: string; label: string }> = {
  aberto: { color: 'blue', label: 'Aberto' },
  'em-andamento': { color: 'orange', label: 'Em Andamento' },
  concluido: { color: 'green', label: 'Concluído' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

interface PartnerFirm {
  id: string; name: string; type: 'juridico' | 'contabil' | 'ambos'; specialties: string[];
  contact: string; email: string; phone: string; city: string; rating: number;
}

interface Professional {
  id: string; name: string; type: 'juridico' | 'contabil'; specialty: string;
  rating: number; completed: number; hourlyRate: number; available: boolean; bio: string;
}

interface DiscountDeal {
  id: string; partner: string; type: 'juridico' | 'contabil' | 'ambos'; discount: number;
  description: string; validUntil: string; active: boolean;
}

const firms: PartnerFirm[] = [
  { id: 'f1', name: 'Almeida & Vieira Advogados', type: 'juridico', specialties: ['Contratos', 'LGPD', 'Marcas'], contact: 'Dr. Marcos Almeida', email: 'contato@almeidavieira.adv.br', phone: '(11) 3456-7890', city: 'São Paulo, SP', rating: 4.8 },
  { id: 'f2', name: 'Lopes Contabilidade Digital', type: 'contabil', specialties: ['MEI', 'CNPJ', 'IR', 'Tributário'], contact: 'Contador Ricardo Lopes', email: 'ricardo@lopescontabil.com.br', phone: '(11) 2345-6789', city: 'São Paulo, SP', rating: 4.6 },
  { id: 'f3', name: 'Beatriz Contadores Associados', type: 'contabil', specialties: ['Balanço', 'Fiscal', 'Folha'], contact: 'Contadora Ana Beatriz', email: 'ana@beatrizcontadores.com.br', phone: '(21) 3456-1234', city: 'Rio de Janeiro, RJ', rating: 4.5 },
  { id: 'f4', name: 'Vieira & Santos Advocacia', type: 'juridico', specialties: ['Direito Digital', 'Contratos', 'Trabalhista'], contact: 'Dra. Carla Vieira', email: 'carla@vieirasantos.adv.br', phone: '(31) 4567-8901', city: 'Belo Horizonte, MG', rating: 4.9 },
];

const professionals: Professional[] = [
  { id: 'p1', name: 'Dr. Marcos Almeida', type: 'juridico', specialty: 'Contratos e LGPD', rating: 4.9, completed: 28, hourlyRate: 250, available: true, bio: 'Especialista em direito digital e proteção de dados com 12 anos de experiência.' },
  { id: 'p2', name: 'Dra. Carla Vieira', type: 'juridico', specialty: 'Direito Digital e Marcas', rating: 4.8, completed: 22, hourlyRate: 280, available: true, bio: 'Advogada especializada em propriedade intelectual e registro de marcas.' },
  { id: 'p3', name: 'Contador Ricardo Lopes', type: 'contabil', specialty: 'MEI e Abertura de CNPJ', rating: 4.7, completed: 35, hourlyRate: 180, available: true, bio: 'Contador digital focado em influenciadores e criadores de conteúdo.' },
  { id: 'p4', name: 'Contadora Ana Beatriz', type: 'contabil', specialty: 'Tributário e Fiscal', rating: 4.5, completed: 19, hourlyRate: 200, available: false, bio: 'Planejamento tributário para pequenas empresas e MEIs.' },
  { id: 'p5', name: 'Dr. Paulo Henrique', type: 'juridico', specialty: 'Trabalhista e Contratos', rating: 4.6, completed: 14, hourlyRate: 220, available: true, bio: 'Advogado autônomo com foco em relações de trabalho para criadores.' },
  { id: 'p6', name: 'Contadora Juliana Martins', type: 'contabil', specialty: 'Declaração IR e Balanço', rating: 4.4, completed: 11, hourlyRate: 160, available: true, bio: 'Contadora independente, atende remotamente todo o Brasil.' },
];

const deals: DiscountDeal[] = [
  { id: 'd1', partner: 'Almeida & Vieira Advogados', type: 'juridico', discount: 30, description: 'Revisão de contratos e consultoria LGPD com 30% off para associados DigitaisBR.', validUntil: '2026-12-31', active: true },
  { id: 'd2', partner: 'Lopes Contabilidade Digital', type: 'contabil', discount: 25, description: 'Abertura de CNPJ e declaração de IR com 25% de desconto.', validUntil: '2026-12-31', active: true },
  { id: 'd3', partner: 'Vieira & Santos Advocacia', type: 'juridico', discount: 20, description: 'Registro de marca e propriedade intelectual com 20% off.', validUntil: '2027-06-30', active: true },
  { id: 'd4', partner: 'Beatriz Contadores Associados', type: 'contabil', discount: 15, description: 'Planejamento tributário e fiscal com 15% de desconto.', validUntil: '2026-09-30', active: true },
];

export default function PortalServicosPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.servicos.list);
  const { user } = useAppSelector((s) => s.auth);
  const associados = useAppSelector((s) => s.associados.list);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchProf, setSearchProf] = useState('');
  const [profTypeFilter, setProfTypeFilter] = useState<string>('all');

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const myRequests = requests.filter((r) => r.associadoId === (associado?.id || 'assoc-1'));
  const myOpen = myRequests.filter((r) => r.status === 'aberto' || r.status === 'em-andamento').length;


  const filteredProfs = professionals.filter((p) => {
    if (profTypeFilter !== 'all' && p.type !== profTypeFilter) return false;
    if (searchProf && !p.name.toLowerCase().includes(searchProf.toLowerCase()) && !p.specialty.toLowerCase().includes(searchProf.toLowerCase())) return false;
    return true;
  });

  const handleRequest = (values: { title: string; type: ServiceType; professionalName?: string; description: string }) => {
    const req: ServiceRequest = {
      id: `srv-${Date.now()}`, type: values.type, title: values.title, description: values.description,
      associadoId: associado?.id || 'assoc-1', associadoName: associado?.name || user?.name || 'Associado',
      professionalName: values.professionalName || '', status: 'aberto',
      scheduledAt: null, documents: [], rating: null, createdAt: new Date().toISOString(),
    };
    dispatch(addServiceRequest(req));
    message.success('Solicitação enviada! Entraremos em contato em breve.');
    setFormOpen(false);
    form.resetFields();
  };

  const ProfCard = ({ p }: { p: Professional }) => (
    <div style={{ minWidth: 260, maxWidth: 320, padding: 16, border: '1px solid #f0f0f0', borderRadius: 10, background: '#fff', flexShrink: 0, position: 'relative', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
      {p.available ? <div style={{ position: 'absolute', top: 12, right: 12 }}><Tag color="green">Disponível</Tag></div> : <div style={{ position: 'absolute', top: 12, right: 12 }}><Tag>Indisponível</Tag></div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: p.type === 'juridico' ? '#1677ff' : '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
          {p.name.charAt(0)}
        </div>
        <div>
          <Text strong style={{ fontSize: 14 }}>{p.name}</Text>
          <div><Tag color={typeConfig[p.type].color} style={{ fontSize: 10, margin: 0 }}>{p.specialty}</Tag></div>
        </div>
      </div>
      <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 10 }}>{p.bio}</Paragraph>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Space size={4}><Rate disabled defaultValue={p.rating} style={{ fontSize: 12 }} /><Text type="secondary" style={{ fontSize: 11 }}>({p.completed})</Text></Space>
        <Text strong style={{ color: '#52c41a' }}>R$ {p.hourlyRate}/h</Text>
      </div>
      {p.available && (
        <Button type="primary" size="small" block icon={<CalendarOutlined />} onClick={() => { form.setFieldsValue({ professionalName: p.name, type: p.type }); setFormOpen(true); }}>
          Solicitar Atendimento
        </Button>
      )}
    </div>
  );

  const DealCard = ({ d }: { d: DiscountDeal }) => {
    const expired = new Date(d.validUntil) < new Date();
    return (
      <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${expired ? '#d9d9d9' : '#52c41a'}`, background: expired ? '#fafafa' : '#f6ffed', transition: 'box-shadow 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <TagOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ fontSize: 14 }}>{d.partner}</Text>
              <Tag color={d.type === 'juridico' ? 'blue' : d.type === 'contabil' ? 'green' : 'purple'}>{d.type === 'ambos' ? 'Jur + Cont' : typeConfig[d.type as ServiceType]?.label}</Tag>
              {expired && <Tag color="red">Expirado</Tag>}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>{d.description}</Text>
            <div style={{ marginTop: 6, fontSize: 12 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />Válido até {new Date(d.validUntil).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div style={{ background: expired ? '#d9d9d9' : '#52c41a', color: '#fff', borderRadius: 8, padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{d.discount}%</div>
            <div style={{ fontSize: 10 }}>OFF</div>
          </div>
        </div>
      </div>
    );
  };

  const FirmCard = ({ f }: { f: PartnerFirm }) => (
    <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${f.type === 'juridico' ? '#1677ff' : f.type === 'contabil' ? '#52c41a' : '#722ed1'}`, background: '#fff', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <ShopOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 15 }}>{f.name}</Text>
            <Tag color={f.type === 'juridico' ? 'blue' : f.type === 'contabil' ? 'green' : 'purple'}>{f.type === 'ambos' ? 'Jurídico + Contábil' : typeConfig[f.type].label}</Tag>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {f.specialties.map((s) => <Tag key={s} style={{ fontSize: 11, margin: 0 }}>{s}</Tag>)}
          </div>
          <Space size={16} style={{ fontSize: 12, color: '#666' }} wrap>
            <span><UserOutlined style={{ marginRight: 4 }} />{f.contact}</span>
            <span><MailOutlined style={{ marginRight: 4 }} />{f.email}</span>
            <span><PhoneOutlined style={{ marginRight: 4 }} />{f.phone}</span>
            <span><EnvironmentOutlined style={{ marginRight: 4 }} />{f.city}</span>
          </Space>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <Rate disabled defaultValue={f.rating} style={{ fontSize: 13 }} />
          <div>
            <Button type="primary" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => setFormOpen(true)}>Solicitar</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabItems = [
    {
      key: 'profissionais',
      label: <span><TeamOutlined style={{ marginRight: 4 }} />Encontrar Profissional</span>,
      children: (
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>Escolha um profissional e solicite atendimento direto pela plataforma.</Text>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input placeholder="Buscar profissional ou especialidade..." prefix={<SearchOutlined />} value={searchProf} onChange={(e) => setSearchProf(e.target.value)} style={{ width: 300 }} allowClear />
            <Select value={profTypeFilter} onChange={setProfTypeFilter} style={{ width: 140 }}>
              <Select.Option value="all">Todos tipos</Select.Option>
              <Select.Option value="juridico">Jurídico</Select.Option>
              <Select.Option value="contabil">Contábil</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {filteredProfs.map((p) => <ProfCard key={p.id} p={p} />)}
          </div>
        </div>
      ),
    },
    {
      key: 'escritorios',
      label: <span><ShopOutlined style={{ marginRight: 4 }} />Escritórios Parceiros</span>,
      children: (
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>Escritórios parceiros da DigitaisBR para assessoria jurídica e contábil.</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {firms.map((f) => <FirmCard key={f.id} f={f} />)}
          </div>
        </div>
      ),
    },
    {
      key: 'descontos',
      label: <span><TagOutlined style={{ marginRight: 4 }} />Descontos Exclusivos</span>,
      children: (
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>Convênios e descontos exclusivos para associados DigitaisBR.</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deals.filter((d) => d.active).map((d) => <DealCard key={d.id} d={d} />)}
          </div>
        </div>
      ),
    },
    {
      key: 'minhas',
      label: <Badge count={myOpen} size="small" offset={[8, -2]}><span><CalendarOutlined style={{ marginRight: 4 }} />Minhas Solicitações</span></Badge>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Text type="secondary">Acompanhe suas solicitações de assessoria</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Nova Solicitação</Button>
          </div>
          {myRequests.length === 0 ? (
            <Empty description="Você ainda não fez nenhuma solicitação." image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => setFormOpen(true)}>Solicitar Serviço</Button>
            </Empty>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myRequests.map((r) => {
                const tc = typeConfig[r.type];
                const sc = statusLabels[r.status];
                return (
                  <div key={r.id} style={{ padding: 14, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${tc.hex}`, background: r.status === 'aberto' ? '#f0f5ff' : r.status === 'concluido' ? '#f6ffed' : '#fff', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                          <Tag color={tc.color} icon={tc.icon} style={{ margin: 0 }}>{tc.label}</Tag>
                          <Tag color={sc.color} style={{ margin: 0 }}>{sc.label}</Tag>
                        </div>
                        <Text strong style={{ fontSize: 14 }}>{r.title}</Text>
                        {r.description && <div><Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text></div>}
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          {r.professionalName && <span><AuditOutlined style={{ marginRight: 4 }} />{r.professionalName} · </span>}
                          <CalendarOutlined style={{ marginRight: 4 }} />{new Date(r.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {r.rating && <Rate disabled defaultValue={r.rating} style={{ fontSize: 12, marginTop: 4 }} />}
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {r.status === 'aberto' && <Tag color="blue" icon={<ClockCircleOutlined />}>Aguardando</Tag>}
                        {r.status === 'em-andamento' && <Tag color="orange" icon={<ClockCircleOutlined />}>Em atendimento</Tag>}
                        {r.status === 'concluido' && <Tag color="green" icon={<CheckCircleOutlined />}>Finalizado</Tag>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Assessoria Jurídica & Contábil
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Solicitar Serviço</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Profissionais Disponíveis" value={professionals.filter((p) => p.available).length} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Descontos Ativos" value={deals.filter((d) => d.active).length} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" style={{ borderLeft: '3px solid #fa8c16' }}>
            <Statistic title="Minhas Solicitações" value={myRequests.length} suffix={myOpen > 0 ? `(${myOpen} aberta${myOpen > 1 ? 's' : ''})` : ''} styles={{ content: { color: '#fa8c16', fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs items={tabItems} />
      </Card>

      <Modal title="Solicitar Assessoria" open={formOpen} onCancel={() => { setFormOpen(false); form.resetFields(); }} onOk={() => form.submit()} okText="Enviar Solicitação" cancelText="Cancelar" width={500}>
        <Form form={form} layout="vertical" onFinish={handleRequest}>
          <Form.Item name="title" label="Qual serviço você precisa?" rules={[{ required: true, message: 'Descreva o serviço' }]}>
            <Input placeholder="Ex: Revisão de contrato social, Abrir CNPJ..." />
          </Form.Item>
          <Form.Item name="type" label="Tipo de assessoria" rules={[{ required: true }]}>
            <Select placeholder="Selecione">
              <Select.Option value="juridico"><AuditOutlined style={{ marginRight: 6 }} />Jurídico</Select.Option>
              <Select.Option value="contabil"><BankOutlined style={{ marginRight: 6 }} />Contábil</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="professionalName" label="Profissional preferido (opcional)">
            <Select placeholder="Qualquer disponível" allowClear showSearch optionFilterProp="children">
              {professionals.filter((p) => p.available).map((p) => <Select.Option key={p.id} value={p.name}>{p.name} — {p.specialty}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Detalhes da solicitação" rules={[{ required: true, message: 'Descreva sua necessidade' }]}>
            <Input.TextArea rows={3} placeholder="Descreva o que você precisa em detalhes..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
