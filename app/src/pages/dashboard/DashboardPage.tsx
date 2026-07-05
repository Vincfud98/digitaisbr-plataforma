import { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Tag, List, Space, Progress } from 'antd';
import {
  ShopOutlined, TeamOutlined, ShoppingCartOutlined,
  RiseOutlined, GiftOutlined, BellOutlined, CustomerServiceOutlined,
  StarOutlined, CommentOutlined, ReadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';

const { Title, Text } = Typography;
const CHART_COLORS = ['#1677ff', '#722ed1', '#faad14', '#52c41a', '#f5222d', '#13c2c2'];

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
  const destaques = useAppSelector((s) => s.destaques.list);
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
  const destaquesAtivos = destaques.filter((d) => d.active).length;

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

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Associados Ativos" value={assocAtivos} suffix={`/ ${totalAssociados}`} prefix={<TeamOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Vendas Aprovadas" value={vendasAprovadas} suffix={`/ ${totalVendas}`} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Receita Total" value={receitaTotal} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Lojas Ativas" value={lojasAtivas} suffix={`/ ${lojas.length}`} prefix={<ShopOutlined />} styles={{ content: { color: '#722ed1' } }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Comissões Pagas" value={comissaoPaga} precision={2} prefix="R$" styles={{ content: { color: '#faad14' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Comissões Pendentes" value={comissaoPendente} precision={2} prefix="R$" styles={{ content: { color: '#fa8c16' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Saldo Financeiro" value={saldo} precision={2} prefix="R$" styles={{ content: { color: saldo >= 0 ? '#52c41a' : '#ff4d4f' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Produtos Ativos" value={produtosAtivos} suffix={`/ ${produtos.length}`} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#13c2c2' } }} /></Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined /> Receita e Comissões (6 meses)</>} size="small">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: any, name: any) => [`R$ ${Number(value).toFixed(2)}`, name === 'receita' ? 'Receita' : 'Comissões']} />
                <Area type="monotone" dataKey="receita" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} name="Receita" />
                <Area type="monotone" dataKey="comissoes" stroke="#722ed1" fill="#722ed1" fillOpacity={0.15} name="Comissões" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Associados por Plano" size="small">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={planChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {planChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Vendas por Mês" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="vendas" fill="#1677ff" radius={[4, 4, 0, 0]} name="Vendas" />
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
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Destaques ativos:</Text>
                <Space>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <Text strong>{destaquesAtivos}</Text>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
