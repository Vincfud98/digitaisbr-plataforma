import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Tag, List, Space, Progress, Button, message } from 'antd';
import {
  ShopOutlined, ShoppingCartOutlined, GiftOutlined,
  EyeOutlined, CrownOutlined, RiseOutlined, ReadOutlined,
  TeamOutlined, ThunderboltOutlined, FireOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { PlanType } from '../../types';
import { planLabels, planColors, planPrices } from '../../constants';

const { Title, Text } = Typography;

const CHART_COLORS = ['#52c41a', '#1677ff', '#fa8c16', '#f5222d'];

export default function PortalDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const associados = useAppSelector((s) => s.associados.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const conteudos = useAppSelector((s) => s.conteudos.list);

  const associado = associados.find((a) => a.id === user?.id) || associados.find((a) => a.id === 'assoc-1') || associados[0];
  const plan = (associado?.planType || user?.plan || 'basico') as PlanType;

  const minhaLoja = lojas.find((l) => l.associadoId === associado?.id);
  const minhasVendas = vendas.filter((v) => v.associadoId === associado?.id);
  const vendasAprovadas = minhasVendas.filter((v) => v.status === 'aprovada');
  const receitaVendas = vendasAprovadas.reduce((s, v) => s + v.totalPrice, 0);

  const minhasComissoes = comissoes.filter((c) => c.associadoId === associado?.id);
  const comissaoPaga = minhasComissoes.filter((c) => c.status === 'paga').reduce((s, c) => s + c.commissionValue, 0);
  const comissaoPendente = minhasComissoes.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.commissionValue, 0);

  const beneficiosDisponiveis = beneficios.filter((b) => {
    if (b.status !== 'ativo') return false;
    const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];
    return planOrder.indexOf(b.minPlan) <= planOrder.indexOf(plan);
  });

  const conteudosDisponiveis = conteudos.filter((c) => {
    if (c.status !== 'publicado') return false;
    const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];
    return planOrder.indexOf(c.minPlan) <= planOrder.indexOf(plan);
  });


  const vendasRecentes = [...minhasVendas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const salesChartData = useMemo(() => {
    const months: Record<string, { vendas: number; receita: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('pt-BR', { month: 'short' });
      months[key] = { vendas: 0, receita: 0 };
    }
    minhasVendas.forEach((v) => {
      const d = new Date(v.createdAt);
      const key = d.toLocaleDateString('pt-BR', { month: 'short' });
      if (months[key]) {
        months[key].vendas++;
        months[key].receita += v.totalPrice;
      }
    });
    return Object.entries(months).map(([mes, data]) => ({ mes, ...data }));
  }, [minhasVendas]);

  const statusData = useMemo(() => {
    const counts = { aprovada: 0, pendente: 0, cancelada: 0, reembolsada: 0 };
    minhasVendas.forEach((v) => {
      if (counts[v.status] !== undefined) counts[v.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [minhasVendas]);

  const commissionChartData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[d.toLocaleDateString('pt-BR', { month: 'short' })] = 0;
    }
    minhasComissoes.forEach((c) => {
      const d = new Date(c.createdAt);
      const key = d.toLocaleDateString('pt-BR', { month: 'short' });
      if (months[key] !== undefined) months[key] += c.commissionValue;
    });
    return Object.entries(months).map(([mes, valor]) => ({ mes, valor }));
  }, [minhasComissoes]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Olá, {associado?.name || user?.name || 'Associado'}!
        </Title>
        <Text type="secondary">
          Plano <Tag color={planColors[plan]}>{planLabels[plan]}</Tag> · R$ {planPrices[plan].toFixed(2)}/mês
        </Text>
      </div>

      {/* Creator Metrics */}
      <Card size="small" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff, #f9f0ff)', border: '1px solid #d6e4ff' }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg, #1677ff, #722ed1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FireOutlined style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 13 }}>{associado?.niche || 'Creator'}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>{associado?.instagram || '@creator'}</Text>
              </div>
            </div>
          </Col>
          <Col xs={8} sm={4} style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>
              {associado?.followers ? (associado.followers >= 1000 ? (associado.followers / 1000).toFixed(1).replace('.0', '') + 'K' : associado.followers) : '—'}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Seguidores</Text>
          </Col>
          <Col xs={8} sm={4} style={{ textAlign: 'center' }}>
            <ThunderboltOutlined style={{ color: '#722ed1', fontSize: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#722ed1' }}>{associado?.engagementRate || 0}%</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Engajamento</Text>
          </Col>
          <Col xs={8} sm={4} style={{ textAlign: 'center' }}>
            <EyeOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#52c41a' }}>{minhaLoja?.totalViews?.toLocaleString() || 0}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Visitas</Text>
          </Col>
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Button type="primary" size="small" icon={<LinkOutlined />} style={{ borderRadius: 16 }}
              onClick={() => { const url = `https://digitaisbr-plataforma.web.app/loja/${associado?.storeSlug}`; navigator.clipboard.writeText(url).then(() => message.success('Link copiado!')); }}>
              Copiar meu link
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/portal/vendas')}>
            <Statistic title="Vendas Aprovadas" value={vendasAprovadas.length} suffix={`/ ${minhasVendas.length}`} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/portal/vendas')}>
            <Statistic title="Receita Total" value={receitaVendas} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Comissões Recebidas" value={comissaoPaga} precision={2} prefix="R$" styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Comissões Pendentes" value={comissaoPendente} precision={2} prefix="R$" styles={{ content: { color: '#fa8c16' } }} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined /> Vendas nos últimos 6 meses</>} size="small">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: any, name: any) => [name === 'receita' ? `R$ ${Number(value).toFixed(2)}` : value, name === 'receita' ? 'Receita' : 'Vendas']} />
                <Area type="monotone" dataKey="vendas" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} name="Vendas" />
                <Area type="monotone" dataKey="receita" stroke="#1677ff" fill="#1677ff" fillOpacity={0.1} name="Receita" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Status das Vendas" size="small">
            {statusData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">Sem vendas ainda</Text>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Comissões Mensais" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commissionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Comissão']} />
                <Bar dataKey="valor" fill="#722ed1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><CrownOutlined /> Meu Plano</>} size="small"
            extra={<a onClick={() => navigate('/portal/plano')}>Detalhes</a>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Tag color={planColors[plan]} style={{ fontSize: 14, padding: '4px 12px' }}>{planLabels[plan]}</Tag>
              <Text strong style={{ fontSize: 18 }}>R$ {planPrices[plan].toFixed(2)}/mês</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Benefícios utilizados</Text>
              <Progress percent={Math.round((beneficiosDisponiveis.length / Math.max(beneficios.filter((b) => b.status === 'ativo').length, 1)) * 100)} size="small" />
            </div>
            <div>
              <Text type="secondary">Conteúdos disponíveis</Text>
              <Progress percent={Math.round((conteudosDisponiveis.length / Math.max(conteudos.filter((c) => c.status === 'publicado').length, 1)) * 100)} size="small" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable onClick={() => navigate('/portal/loja')} style={{ textAlign: 'center' }}>
            <ShopOutlined style={{ fontSize: 20, color: '#722ed1' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>{minhaLoja?.productIds.length || 0}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Produtos na Loja</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable onClick={() => navigate('/portal/loja')} style={{ textAlign: 'center' }}>
            <EyeOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>{minhaLoja?.totalViews || 0}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Visitas na Loja</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable onClick={() => navigate('/portal/beneficios')} style={{ textAlign: 'center' }}>
            <GiftOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>{beneficiosDisponiveis.length}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Benefícios</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable onClick={() => navigate('/portal/conteudos')} style={{ textAlign: 'center' }}>
            <ReadOutlined style={{ fontSize: 20, color: '#faad14' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>{conteudosDisponiveis.length}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Conteúdos</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ShoppingCartOutlined /> Vendas Recentes</>} size="small"
            extra={<a onClick={() => navigate('/portal/vendas')}>Ver todas</a>}>
            {vendasRecentes.length === 0 ? (
              <Text type="secondary">Nenhuma venda ainda.</Text>
            ) : (
              <List
                size="small"
                dataSource={vendasRecentes}
                renderItem={(v) => (
                  <List.Item>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13 }}>{v.customerName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(v.createdAt).toLocaleDateString('pt-BR')} · {v.quantity} item(s)
                      </Text>
                    </div>
                    <Space>
                      <Text strong style={{ color: '#52c41a' }}>R$ {v.totalPrice.toFixed(2)}</Text>
                      <Tag color={v.status === 'aprovada' ? 'green' : v.status === 'pendente' ? 'orange' : 'default'}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </Tag>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><GiftOutlined /> Meus Benefícios</>} size="small"
            extra={<a onClick={() => navigate('/portal/beneficios')}>Ver todos</a>}>
            {beneficiosDisponiveis.length === 0 ? (
              <Text type="secondary">Nenhum benefício disponível.</Text>
            ) : (
              <List
                size="small"
                dataSource={beneficiosDisponiveis.slice(0, 5)}
                renderItem={(b) => (
                  <List.Item>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13 }}>{b.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{b.description.slice(0, 60)}...</Text>
                    </div>
                    <Tag color="green">{b.value}</Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
