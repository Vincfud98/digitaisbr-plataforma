import { useState } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Rate, message, Modal, Form, DatePicker, Tabs, Badge, Popconfirm } from 'antd';
import {
  AuditOutlined, SearchOutlined, PlusOutlined, CalendarOutlined, BankOutlined,
  CheckCircleOutlined, ClockCircleOutlined, UserOutlined, ShopOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, TagOutlined, TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addServiceRequest, updateServiceStatus } from '../../store/slices/servicosSlice';
import type { ServiceRequest, ServiceRequestStatus, ServiceType } from '../../types';

const { Title, Text, Paragraph } = Typography;

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

interface PartnerFirm {
  id: string; name: string; type: 'juridico' | 'contabil' | 'ambos'; specialties: string[];
  contact: string; email: string; phone: string; city: string; rating: number; services: number; active: boolean;
}

interface Professional {
  id: string; name: string; type: 'juridico' | 'contabil'; specialty: string; firmName: string | null;
  rating: number; completed: number; hourlyRate: number; available: boolean; bio: string;
}

interface DiscountDeal {
  id: string; partner: string; type: 'juridico' | 'contabil' | 'ambos'; discount: number;
  description: string; validUntil: string; active: boolean; usageCount: number;
}

const mockFirms: PartnerFirm[] = [
  { id: 'f1', name: 'Almeida & Vieira Advogados', type: 'juridico', specialties: ['Contratos', 'LGPD', 'Marcas'], contact: 'Dr. Marcos Almeida', email: 'contato@almeidavieira.adv.br', phone: '(11) 3456-7890', city: 'São Paulo, SP', rating: 4.8, services: 42, active: true },
  { id: 'f2', name: 'Lopes Contabilidade Digital', type: 'contabil', specialties: ['MEI', 'CNPJ', 'IR', 'Tributário'], contact: 'Contador Ricardo Lopes', email: 'ricardo@lopescontabil.com.br', phone: '(11) 2345-6789', city: 'São Paulo, SP', rating: 4.6, services: 38, active: true },
  { id: 'f3', name: 'Beatriz Contadores Associados', type: 'contabil', specialties: ['Balanço', 'Fiscal', 'Folha'], contact: 'Contadora Ana Beatriz', email: 'ana@beatrizcontadores.com.br', phone: '(21) 3456-1234', city: 'Rio de Janeiro, RJ', rating: 4.5, services: 25, active: true },
  { id: 'f4', name: 'Vieira & Santos Advocacia', type: 'juridico', specialties: ['Direito Digital', 'Contratos', 'Trabalhista'], contact: 'Dra. Carla Vieira', email: 'carla@vieirasantos.adv.br', phone: '(31) 4567-8901', city: 'Belo Horizonte, MG', rating: 4.9, services: 31, active: true },
  { id: 'f5', name: 'Nexo Assessoria Integrada', type: 'ambos', specialties: ['Abertura CNPJ', 'Contratos', 'Planejamento Tributário'], contact: 'Dr. Felipe Nexo', email: 'contato@nexoassessoria.com.br', phone: '(41) 5678-9012', city: 'Curitiba, PR', rating: 4.3, services: 15, active: false },
];

const mockProfessionals: Professional[] = [
  { id: 'p1', name: 'Dr. Marcos Almeida', type: 'juridico', specialty: 'Contratos e LGPD', firmName: 'Almeida & Vieira Advogados', rating: 4.9, completed: 28, hourlyRate: 250, available: true, bio: 'Especialista em direito digital e proteção de dados com 12 anos de experiência.' },
  { id: 'p2', name: 'Dra. Carla Vieira', type: 'juridico', specialty: 'Direito Digital e Marcas', firmName: 'Vieira & Santos Advocacia', rating: 4.8, completed: 22, hourlyRate: 280, available: true, bio: 'Advogada especializada em propriedade intelectual e registro de marcas.' },
  { id: 'p3', name: 'Contador Ricardo Lopes', type: 'contabil', specialty: 'MEI e Abertura de CNPJ', firmName: 'Lopes Contabilidade Digital', rating: 4.7, completed: 35, hourlyRate: 180, available: true, bio: 'Contador digital focado em influenciadores e criadores de conteúdo.' },
  { id: 'p4', name: 'Contadora Ana Beatriz', type: 'contabil', specialty: 'Tributário e Fiscal', firmName: 'Beatriz Contadores Associados', rating: 4.5, completed: 19, hourlyRate: 200, available: false, bio: 'Planejamento tributário para pequenas empresas e MEIs.' },
  { id: 'p5', name: 'Dr. Paulo Henrique', type: 'juridico', specialty: 'Trabalhista e Contratos', firmName: null, rating: 4.6, completed: 14, hourlyRate: 220, available: true, bio: 'Advogado autônomo com foco em relações de trabalho para criadores.' },
  { id: 'p6', name: 'Contadora Juliana Martins', type: 'contabil', specialty: 'Declaração IR e Balanço', firmName: null, rating: 4.4, completed: 11, hourlyRate: 160, available: true, bio: 'Contadora independente, atende remotamente todo o Brasil.' },
];

const mockDeals: DiscountDeal[] = [
  { id: 'd1', partner: 'Almeida & Vieira Advogados', type: 'juridico', discount: 30, description: 'Revisão de contratos e consultoria LGPD com 30% off para associados DigitaisBR.', validUntil: '2026-12-31', active: true, usageCount: 18 },
  { id: 'd2', partner: 'Lopes Contabilidade Digital', type: 'contabil', discount: 25, description: 'Abertura de CNPJ e declaração de IR com 25% de desconto.', validUntil: '2026-12-31', active: true, usageCount: 24 },
  { id: 'd3', partner: 'Vieira & Santos Advocacia', type: 'juridico', discount: 20, description: 'Registro de marca e propriedade intelectual com 20% off.', validUntil: '2027-06-30', active: true, usageCount: 9 },
  { id: 'd4', partner: 'Beatriz Contadores Associados', type: 'contabil', discount: 15, description: 'Planejamento tributário e fiscal com 15% de desconto.', validUntil: '2026-09-30', active: true, usageCount: 12 },
  { id: 'd5', partner: 'Nexo Assessoria Integrada', type: 'ambos', discount: 35, description: 'Pacote completo jurídico + contábil para novos CNPJs.', validUntil: '2026-06-30', active: false, usageCount: 5 },
];

export default function ServicosPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.servicos.list);
  const associados = useAppSelector((s) => s.associados.list);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchFirm, setSearchFirm] = useState('');
  const [searchProf, setSearchProf] = useState('');
  const [profTypeFilter, setProfTypeFilter] = useState<string>('all');
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState<string>('all');

  const totalAberto = requests.filter((r) => r.status === 'aberto').length;
  const totalAndamento = requests.filter((r) => r.status === 'em-andamento').length;
  const totalConcluido = requests.filter((r) => r.status === 'concluido').length;
  const activeFirms = mockFirms.filter((f) => f.active).length;
  const availableProfs = mockProfessionals.filter((p) => p.available).length;
  const activeDeals = mockDeals.filter((d) => d.active).length;

  const filteredFirms = mockFirms.filter((f) => !searchFirm || f.name.toLowerCase().includes(searchFirm.toLowerCase()) || f.specialties.some((s) => s.toLowerCase().includes(searchFirm.toLowerCase())));

  const filteredProfs = mockProfessionals.filter((p) => {
    if (profTypeFilter !== 'all' && p.type !== profTypeFilter) return false;
    if (searchProf && !p.name.toLowerCase().includes(searchProf.toLowerCase()) && !p.specialty.toLowerCase().includes(searchProf.toLowerCase())) return false;
    return true;
  });

  const filteredReqs = requests.filter((r) => {
    if (reqStatusFilter !== 'all' && r.status !== reqStatusFilter) return false;
    if (reqSearch && !r.title.toLowerCase().includes(reqSearch.toLowerCase()) && !r.associadoName.toLowerCase().includes(reqSearch.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (values: { title: string; type: ServiceType; associadoId: string; professionalName?: string; scheduledAt?: any; description: string }) => {
    const assoc = associados.find((a) => a.id === values.associadoId);
    const req: ServiceRequest = {
      id: `srv-${Date.now()}`, type: values.type, title: values.title, description: values.description,
      associadoId: values.associadoId, associadoName: assoc?.name || 'Associado',
      professionalName: values.professionalName || '', status: 'aberto',
      scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : null,
      documents: [], rating: null, createdAt: new Date().toISOString(),
    };
    dispatch(addServiceRequest(req));
    message.success('Solicitação criada!');
    setFormOpen(false);
    form.resetFields();
  };

  const FirmCard = ({ f }: { f: PartnerFirm }) => (
    <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${f.type === 'juridico' ? '#1677ff' : f.type === 'contabil' ? '#52c41a' : '#722ed1'}`, background: f.active ? '#fff' : '#fafafa', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <ShopOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 15 }}>{f.name}</Text>
            <Tag color={f.type === 'juridico' ? 'blue' : f.type === 'contabil' ? 'green' : 'purple'}>{f.type === 'ambos' ? 'Jurídico + Contábil' : typeConfig[f.type].label}</Tag>
            {!f.active && <Tag>Inativo</Tag>}
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
          <div style={{ marginBottom: 4 }}><Rate disabled defaultValue={f.rating} style={{ fontSize: 13 }} /></div>
          <Text type="secondary" style={{ fontSize: 11 }}>{f.services} atendimentos</Text>
        </div>
      </div>
    </div>
  );

  const ProfCard = ({ p }: { p: Professional }) => (
    <div style={{ minWidth: 260, maxWidth: 320, padding: 16, border: '1px solid #f0f0f0', borderRadius: 10, background: '#fff', flexShrink: 0, position: 'relative', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
      {p.available && <div style={{ position: 'absolute', top: 12, right: 12 }}><Tag color="green">Disponível</Tag></div>}
      {!p.available && <div style={{ position: 'absolute', top: 12, right: 12 }}><Tag>Indisponível</Tag></div>}
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
      {p.firmName && <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}><ShopOutlined style={{ marginRight: 4 }} />{p.firmName}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={4}><Rate disabled defaultValue={p.rating} style={{ fontSize: 12 }} /><Text type="secondary" style={{ fontSize: 11 }}>({p.completed})</Text></Space>
        <Text strong style={{ color: '#52c41a' }}>R$ {p.hourlyRate}/h</Text>
      </div>
    </div>
  );

  const DealCard = ({ d }: { d: DiscountDeal }) => {
    const expired = new Date(d.validUntil) < new Date();
    return (
      <div style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${expired || !d.active ? '#d9d9d9' : '#52c41a'}`, background: expired || !d.active ? '#fafafa' : '#f6ffed', transition: 'box-shadow 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <TagOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ fontSize: 14 }}>{d.partner}</Text>
              <Tag color={d.type === 'juridico' ? 'blue' : d.type === 'contabil' ? 'green' : 'purple'}>{d.type === 'ambos' ? 'Jur + Cont' : typeConfig[d.type as ServiceType]?.label}</Tag>
              {expired && <Tag color="red">Expirado</Tag>}
              {!d.active && !expired && <Tag>Inativo</Tag>}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>{d.description}</Text>
            <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 12 }}>
              <span><CalendarOutlined style={{ marginRight: 4 }} />Até {new Date(d.validUntil).toLocaleDateString('pt-BR')}</span>
              <span><TeamOutlined style={{ marginRight: 4 }} />{d.usageCount} uso{d.usageCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div style={{ background: '#52c41a', color: '#fff', borderRadius: 8, padding: '8px 14px', textAlign: 'center', flexShrink: 0, opacity: expired || !d.active ? 0.4 : 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{d.discount}%</div>
            <div style={{ fontSize: 10 }}>OFF</div>
          </div>
        </div>
      </div>
    );
  };

  const ReqCard = ({ r }: { r: ServiceRequest }) => {
    const tc = typeConfig[r.type];
    const sc = statusConfig[r.status];
    return (
      <div style={{ padding: 14, border: '1px solid #f0f0f0', borderRadius: 8, borderLeft: `3px solid ${tc.hex}`, background: r.status === 'aberto' ? '#f0f5ff' : '#fff', transition: 'box-shadow 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <Tag style={{ margin: 0, fontFamily: 'monospace', fontSize: 10 }}>{r.id.toUpperCase()}</Tag>
              <Tag color={tc.color} icon={tc.icon} style={{ margin: 0 }}>{tc.label}</Tag>
              <Tag color={sc.color} style={{ margin: 0 }}>{sc.label}</Tag>
            </div>
            <Text strong style={{ fontSize: 13 }}>{r.title}</Text>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              <UserOutlined style={{ marginRight: 4 }} />{r.associadoName}
              {r.professionalName && <span> · <AuditOutlined style={{ marginRight: 4 }} />{r.professionalName}</span>}
              {r.scheduledAt && <span> · <CalendarOutlined style={{ marginRight: 4 }} />{new Date(r.scheduledAt).toLocaleDateString('pt-BR')}</span>}
            </div>
            {r.rating && <Rate disabled defaultValue={r.rating} style={{ fontSize: 12, marginTop: 4 }} />}
          </div>
          <div style={{ flexShrink: 0 }}>
            {r.status === 'aberto' && (
              <Popconfirm title="Iniciar atendimento?" okText="Sim" cancelText="Não" onConfirm={() => { dispatch(updateServiceStatus({ id: r.id, status: 'em-andamento' })); message.success('Em andamento!'); }}>
                <Button size="small" icon={<ClockCircleOutlined />}>Iniciar</Button>
              </Popconfirm>
            )}
            {r.status === 'em-andamento' && (
              <Popconfirm title="Marcar como concluído?" okText="Sim" cancelText="Não" onConfirm={() => { dispatch(updateServiceStatus({ id: r.id, status: 'concluido' })); message.success('Concluído!'); }}>
                <Button size="small" type="primary" style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />}>Concluir</Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'escritorios',
      label: <span><ShopOutlined style={{ marginRight: 4 }} />Escritórios Parceiros</span>,
      children: (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input placeholder="Buscar escritório ou especialidade..." prefix={<SearchOutlined />} value={searchFirm} onChange={(e) => setSearchFirm(e.target.value)} style={{ width: 320 }} allowClear />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Cadastro de escritórios será integrado com o backend.')}>Novo Parceiro</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredFirms.map((f) => <FirmCard key={f.id} f={f} />)}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>{filteredFirms.length} escritório{filteredFirms.length !== 1 ? 's' : ''}</div>
        </div>
      ),
    },
    {
      key: 'marketplace',
      label: <span><TeamOutlined style={{ marginRight: 4 }} />Marketplace</span>,
      children: (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input placeholder="Buscar profissional ou especialidade..." prefix={<SearchOutlined />} value={searchProf} onChange={(e) => setSearchProf(e.target.value)} style={{ width: 300 }} allowClear />
            <Select value={profTypeFilter} onChange={setProfTypeFilter} style={{ width: 140 }}>
              <Select.Option value="all">Todos tipos</Select.Option>
              <Select.Option value="juridico">Jurídico</Select.Option>
              <Select.Option value="contabil">Contábil</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, flexWrap: 'wrap' }}>
            {filteredProfs.map((p) => <ProfCard key={p.id} p={p} />)}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: '#888' }}>{filteredProfs.length} profissiona{filteredProfs.length !== 1 ? 'is' : 'l'}</div>
        </div>
      ),
    },
    {
      key: 'convenios',
      label: <span><TagOutlined style={{ marginRight: 4 }} />Convênios & Descontos</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text type="secondary">Descontos exclusivos para associados DigitaisBR</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Cadastro de convênios será integrado com o backend.')}>Novo Convênio</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mockDeals.map((d) => <DealCard key={d.id} d={d} />)}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>{mockDeals.length} convênio{mockDeals.length !== 1 ? 's' : ''}</div>
        </div>
      ),
    },
    {
      key: 'solicitacoes',
      label: <Badge count={totalAberto} size="small" offset={[8, -2]}><span><CalendarOutlined style={{ marginRight: 4 }} />Solicitações</span></Badge>,
      children: (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input placeholder="Buscar solicitação ou associado..." prefix={<SearchOutlined />} value={reqSearch} onChange={(e) => setReqSearch(e.target.value)} style={{ width: 300 }} allowClear />
            <Select value={reqStatusFilter} onChange={setReqStatusFilter} style={{ width: 160 }}>
              <Select.Option value="all">Todos status</Select.Option>
              <Select.Option value="aberto">Aberto</Select.Option>
              <Select.Option value="em-andamento">Em Andamento</Select.Option>
              <Select.Option value="concluido">Concluído</Select.Option>
              <Select.Option value="cancelado">Cancelado</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Nova Solicitação</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredReqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                <AuditOutlined style={{ fontSize: 40, marginBottom: 12 }} /><div>Nenhuma solicitação encontrada</div>
              </div>
            ) : filteredReqs.map((r) => <ReqCard key={r.id} r={r} />)}
          </div>
          {filteredReqs.length > 0 && <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>{filteredReqs.length} solicitaç{filteredReqs.length !== 1 ? 'ões' : 'ão'}</div>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Assessoria Jurídica & Contábil
        </Title>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Escritórios Ativos" value={activeFirms} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Profissionais" value={availableProfs} suffix={`/${mockProfessionals.length}`} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic title="Convênios Ativos" value={activeDeals} styles={{ content: { color: '#722ed1', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #fa8c16' }}>
            <Statistic title="Solicitações Abertas" value={totalAberto} styles={{ content: { color: '#fa8c16', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Em Andamento" value={totalAndamento} styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #888' }}>
            <Statistic title="Concluídos" value={totalConcluido} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs items={tabItems} />
      </Card>

      <Modal title="Nova Solicitação de Serviço" open={formOpen} onCancel={() => { setFormOpen(false); form.resetFields(); }} onOk={() => form.submit()} okText="Enviar" cancelText="Cancelar" width={600}>
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
                  {associados.filter((a) => a.status === 'ativo').map((a) => <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="professionalName" label="Profissional">
                <Select placeholder="Selecione" allowClear showSearch optionFilterProp="children">
                  {mockProfessionals.filter((p) => p.available).map((p) => <Select.Option key={p.id} value={p.name}>{p.name} — {p.specialty}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="scheduledAt" label="Agendamento"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Descreva a solicitação..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
