import { Card, Col, Row, Statistic, Typography, Tag, List, Space, Progress } from 'antd';
import {
  ShopOutlined, ShoppingCartOutlined, GiftOutlined,
  EyeOutlined, CrownOutlined, RiseOutlined, StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';

const { Title, Text } = Typography;

const planLabels: Record<PlanType, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<PlanType, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
const planPrices: Record<PlanType, number> = { basico: 49.90, intermediario: 99.90, avancado: 199.90 };

export default function PortalDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const associados = useAppSelector((s) => s.associados.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const conteudos = useAppSelector((s) => s.conteudos.list);
  const destaques = useAppSelector((s) => s.destaques.list);

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
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

  const meusDestaques = destaques.filter((d) => d.active && d.type === 'loja' && minhaLoja && d.referenceId === minhaLoja.id);

  const vendasRecentes = [...minhasVendas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topBeneficios = [...beneficiosDisponiveis]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

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

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/portal/vendas')}>
            <Statistic title="Vendas Aprovadas" value={vendasAprovadas.length} suffix={`/ ${minhasVendas.length}`} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/portal/vendas')}>
            <Statistic title="Receita Total" value={receitaVendas} precision={2} prefix="R$" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Comissões Recebidas" value={comissaoPaga} precision={2} prefix="R$" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Comissões Pendentes" value={comissaoPendente} precision={2} prefix="R$" valueStyle={{ color: '#fa8c16' }} />
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
          <Card size="small" style={{ textAlign: 'center' }}>
            <StarOutlined style={{ fontSize: 20, color: '#faad14' }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>{meusDestaques.length}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>Destaques Ativos</Text>
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
            <List
              size="small"
              dataSource={topBeneficios}
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
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
        <Col xs={24} lg={12}>
          <Card title={<><RiseOutlined /> Desempenho Mensal</>} size="small">
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#52c41a' }}>{vendasAprovadas.length}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Vendas</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#1677ff' }}>R$ {comissaoPaga.toFixed(0)}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Comissões</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#722ed1' }}>{minhaLoja?.totalViews || 0}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>Visitas</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
