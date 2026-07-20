import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Tag, List, Space, Progress } from 'antd';
import {
  ShopOutlined, TeamOutlined, ShoppingCartOutlined,
  RiseOutlined, GiftOutlined, BellOutlined, CustomerServiceOutlined,
  CommentOutlined, ReadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';

const { Title, Text } = Typography;
const CHART_COLORS = ['#4361ee', '#7209b7', '#ffd166', '#06d6a0', '#ef476f', '#00b4d8'];
const chartCardStyle: React.CSSProperties = { borderRadius: 12, overflow: 'hidden' };

const planColors: Record<PlanType, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
const planLabels: Record<PlanType, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const associados = useAppSelector((s) => s.associados.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const produtos = useAppSelector((s) => s.catalogo.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const parceiros = useAppSelector((s) => s.parceiros.list);
  const conteudos = useAppSelector((s) => s.conteudos.list);
  const comunidade = useAppSelector((s) => s.comunidade.list);
  const notificacoes = useAppSelector((s) => s.notificacoes.list);
  const tickets = useAppSelector((s) => s.suporte.list);
  const financeiro = useAppSelector((s) => s.financeiro.list);

  const plan = user?.plan || 'basico';

  const totalAssociados = associados.length;
  const assocAtivos = associados.filter((a) => a.status === 'ativo').length;
  const totalVendas = vendas.length;
  const vendasAprovadas = vendas.filter((v) => v.status === 'aprovada').length;
  const receitaTotal = vendas.filter((v) => v.status === 'aprovada').reduce((s, v) => s + v.totalPrice, 0);
  const comissaoPaga = comissoes.filter((c) => c.status === 'paga').reduce((s, c) => s + c.commissionValue, 0);
  const comissaoPendente = comissoes.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.commissionValue, 0);
  const lojasAtivas = lojas.filter((l) => l.active).length;
  const produtosAtivos = produtos.filter((p) => p.status === 'ativo').length;
  const beneficiosAtivos = beneficios.filter((b) => b.status === 'ativo').length;
  const parceirosAtivos = parceiros.filter((p) => p.status === 'ativo').length;
  const conteudosPublicados = conteudos.filter((c) => c.status === 'publicado').length;
  const topicosAtivos = comunidade.filter((t) => t.status === 'aberto' || t.status === 'fixado').length;
  const notifNaoLidas = notificacoes.filter((n) => !n.read).length;
  const ticketsAbertos = tickets.filter((t) => t.status === 'aberto' || t.status === 'em-andamento').length;

  const entradas = financeiro.filter((t) => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
  const saidas = financeiro.filter((t) => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
  const saldo = entradas - saidas;

  const planDistribution = {
    basico: associados.filter((a) => a.planType === 'basico').length,
    intermediario: associados.filter((a) => a.planType === 'intermediario').length,
    avancado: associados.filter((a) => a.planType === 'avancado').length,
  };

  const topBeneficios = [...beneficios]
    .filter((b) => b.status === 'ativo')
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const topProdutos = produtos
    .map((p) => ({
      ...p,
      vendasCount: vendas.filter((v) => v.productId === p.id && v.status === 'aprovada').length,
    }))
    .sort((a, b) => b.vendasCount - a.vendasCount)
    .slice(0, 5);

  const recentTopics = [...comunidade]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const revenueChartData = useMemo(() => {
    const months: Record<string, { receita: number; comissoes: number; vendas: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[d.toLocaleDateString('pt-BR', { month: 'short' })] = { receita: 0, comissoes: 0, vendas: 0 };
    }
    vendas.filter((v) => v.status === 'aprovada').forEach((v) => {
      const key = new Date(v.createdAt).toLocaleDateString('pt-BR', { month: 'short' });
      if (months[key]) { months[key].receita += v.totalPrice; months[key].vendas++; }
    });
    comissoes.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString('pt-BR', { month: 'short' });
      if (months[key]) months[key].comissoes += c.commissionValue;
    });
    return Object.entries(months).map(([mes, data]) => ({ mes, ...data }));
  }, [vendas, comissoes]);

  const planChartData = useMemo(() => [
    { name: 'Básico', value: planDistribution.basico },
    { name: 'Intermediário', value: planDistribution.intermediario },
    { name: 'Avançado', value: planDistribution.avancado },
  ].filter((d) => d.value > 0), [planDistribution]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Bem-vindo, {user?.name || 'Usuário'}!
        </Title>
        <Text type="secondary">
          Plano atual: <Tag color={planColors[plan]}>{planLabels[plan]}</Tag>
        </Text>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #4361ee' }}><Statistic title="Associados Ativos" value={assocAtivos} suffix={`/ ${totalAssociados}`} prefix={<TeamOutlined />} styles={{ content: { color: '#4361ee', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #06d6a0' }}><Statistic title="Vendas Aprovadas" value={vendasAprovadas} suffix={`/ ${totalVendas}`} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#06d6a0', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #06d6a0' }}><Statistic title="Receita Total" value={receitaTotal} precision={2} prefix="R$" styles={{ content: { color: '#06d6a0', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #7209b7' }}><Statistic title="Lojas Ativas" value={lojasAtivas} suffix={`/ ${lojas.length}`} prefix={<ShopOutlined />} styles={{ content: { color: '#7209b7', fontWeight: 700 } }} /></Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #ffd166' }}><Statistic title="Comissões Pagas" value={comissaoPaga} precision={2} prefix="R$" styles={{ content: { color: '#d4a017', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #f77f00' }}><Statistic title="Comissões Pendentes" value={comissaoPendente} precision={2} prefix="R$" styles={{ content: { color: '#f77f00', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: `4px solid ${saldo >= 0 ? '#06d6a0' : '#ef476f'}` }}><Statistic title="Saldo Financeiro" value={saldo} precision={2} prefix="R$" styles={{ content: { color: saldo >= 0 ? '#06d6a0' : '#ef476f', fontWeight: 700 } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ borderRadius: 10, borderLeft: '4px solid #00b4d8' }}><Statistic title="Produtos Ativos" value={produtosAtivos} suffix={`/ ${produtos.length}`} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#00b4d8', fontWeight: 700 } }} /></Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined /> Receita e Comissões (6 meses)</>} size="small" style={chartCardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDashReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradDashComissoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7209b7" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7209b7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any, name: any) => [`R$ ${Number(value).toFixed(2)}`, name === 'receita' ? 'Receita' : 'Comissões']} contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="receita" stroke="#06d6a0" strokeWidth={2.5} fill="url(#gradDashReceita)" name="Receita" />
                <Area type="monotone" dataKey="comissoes" stroke="#7209b7" strokeWidth={2} fill="url(#gradDashComissoes)" name="Comissões" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Associados por Plano" size="small" style={chartCardStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={planChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} cornerRadius={4}>
                  {planChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Vendas por Mês" size="small" style={chartCardStyle}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="vendas" fill="#4361ee" radius={[6, 6, 0, 0]} name="Vendas" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <GiftOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{beneficiosAtivos}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Benefícios</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{parceirosAtivos}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Parceiros</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <ReadOutlined style={{ fontSize: 20, color: '#722ed1' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{conteudosPublicados}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Conteúdos</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <CommentOutlined style={{ fontSize: 20, color: '#13c2c2' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{topicosAtivos}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Tópicos</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <BellOutlined style={{ fontSize: 20, color: notifNaoLidas > 0 ? '#ff4d4f' : '#52c41a' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{notifNaoLidas}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Não lidas</Text>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <CustomerServiceOutlined style={{ fontSize: 20, color: ticketsAbertos > 0 ? '#fa8c16' : '#52c41a' }} />
            <div style={{ fontSize: 20, fontWeight: 600 }}>{ticketsAbertos}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Tickets</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title={<><RiseOutlined /> Distribuição por Plano</>} size="small">
            {(['basico', 'intermediario', 'avancado'] as PlanType[]).map((p) => {
              const count = planDistribution[p];
              const pct = totalAssociados > 0 ? Math.round((count / totalAssociados) * 100) : 0;
              return (
                <div key={p} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Tag color={planColors[p]}>{planLabels[p]}</Tag>
                    <Text>{count} ({pct}%)</Text>
                  </div>
                  <Progress percent={pct} showInfo={false} strokeColor={planColors[p] === 'blue' ? '#1677ff' : planColors[p] === 'purple' ? '#722ed1' : '#faad14'} size="small" />
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><GiftOutlined /> Top 5 Benefícios</>} size="small">
            <List
              size="small"
              dataSource={topBeneficios}
              renderItem={(b) => (
                <List.Item>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13 }}>{b.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{b.usageCount} utilizações</Text>
                  </div>
                  <Tag color="green" style={{ fontSize: 11 }}>{b.value}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><ShoppingCartOutlined /> Top 5 Produtos</>} size="small">
            <List
              size="small"
              dataSource={topProdutos}
              renderItem={(p) => (
                <List.Item>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13 }}>{p.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>R$ {p.price.toFixed(2)}</Text>
                  </div>
                  <Tag color="blue">{p.vendasCount} vendas</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><CommentOutlined /> Tópicos Recentes</>} size="small">
            <List
              size="small"
              dataSource={recentTopics}
              renderItem={(t) => (
                <List.Item>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13 }}>{t.title}</Text>
                    <br />
                    <Space style={{ fontSize: 11 }}>
                      <Text type="secondary">{t.authorName}</Text>
                      <Text type="secondary">·</Text>
                      <Text type="secondary">{t.replies} respostas</Text>
                      <Text type="secondary">·</Text>
                      <Text type="secondary">{t.views} views</Text>
                    </Space>
                  </div>
                  <Tag color={t.status === 'fixado' ? 'gold' : t.status === 'aberto' ? 'green' : 'default'}>
                    {t.status === 'fixado' ? 'Fixado' : t.status === 'aberto' ? 'Aberto' : 'Fechado'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><CustomerServiceOutlined /> Resumo do Suporte</>} size="small">
            <Row gutter={[16, 16]}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <ExclamationCircleOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                <div style={{ fontSize: 22, fontWeight: 600 }}>{tickets.filter((t) => t.status === 'aberto').length}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Abertos</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                <div style={{ fontSize: 22, fontWeight: 600 }}>{tickets.filter((t) => t.status === 'em-andamento').length}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Em Andamento</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div style={{ fontSize: 22, fontWeight: 600 }}>{tickets.filter((t) => t.status === 'resolvido' || t.status === 'fechado').length}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Resolvidos</Text>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tickets por prioridade:</Text>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Tag>{tickets.filter((t) => t.priority === 'baixa').length} Baixa</Tag>
                <Tag color="blue">{tickets.filter((t) => t.priority === 'media').length} Média</Tag>
                <Tag color="orange">{tickets.filter((t) => t.priority === 'alta').length} Alta</Tag>
                <Tag color="red">{tickets.filter((t) => t.priority === 'urgente').length} Urgente</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
