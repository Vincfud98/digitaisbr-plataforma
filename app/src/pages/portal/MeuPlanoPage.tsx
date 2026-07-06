import { Card, Typography, Tag, Row, Col, Button, Progress, Descriptions, message, Space } from 'antd';
import {
  CrownOutlined, CheckCircleOutlined, RiseOutlined,
  GiftOutlined, ReadOutlined, ShopOutlined, StarOutlined,
  CalendarOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';

const { Title, Text } = Typography;

const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];
const planLabels: Record<PlanType, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<PlanType, string> = { basico: '#1677ff', intermediario: '#722ed1', avancado: '#faad14' };
const planPrices: Record<PlanType, number> = { basico: 49.90, intermediario: 99.90, avancado: 199.90 };
const planMaxProducts: Record<PlanType, number> = { basico: 20, intermediario: 50, avancado: 999 };

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function MeuPlanoPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const conteudos = useAppSelector((s) => s.conteudos.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const { user } = useAppSelector((s) => s.auth);

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const plan = (associado?.planType || user?.plan || 'basico') as PlanType;
  const planIdx = planOrder.indexOf(plan);

  const beneficiosCount = beneficios.filter((b) => b.status === 'ativo' && planOrder.indexOf(b.minPlan) <= planIdx).length;
  const totalBeneficios = beneficios.filter((b) => b.status === 'ativo').length;
  const conteudosCount = conteudos.filter((c) => c.status === 'publicado' && planOrder.indexOf(c.minPlan) <= planIdx).length;
  const totalConteudos = conteudos.filter((c) => c.status === 'publicado').length;

  const lojaAssociado = useAppSelector((s) => s.lojas.list).find((l) => l.associadoId === 'assoc-1');
  const produtosNaLoja = lojaAssociado?.productIds?.length || 0;
  const maxProdutos = planMaxProducts[plan];

  const minhasVendas = vendas.filter((v) => v.associadoId === 'assoc-1');
  const receitaTotal = minhasVendas.filter((v) => v.status === 'aprovada').reduce((s, v) => s + v.totalPrice, 0);

  const diasDesdeAtivacao = associado?.createdAt
    ? Math.floor((Date.now() - new Date(associado.createdAt).getTime()) / 86400000)
    : 0;

  const nextPlan = planIdx < 2 ? planOrder[planIdx + 1] : null;
  const extraBeneficiosNext = nextPlan
    ? beneficios.filter((b) => b.status === 'ativo' && planOrder.indexOf(b.minPlan) <= planIdx + 1).length - beneficiosCount
    : 0;
  const extraConteudosNext = nextPlan
    ? conteudos.filter((c) => c.status === 'publicado' && planOrder.indexOf(c.minPlan) <= planIdx + 1).length - conteudosCount
    : 0;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <CrownOutlined style={{ marginRight: 8 }} />
        Meu Plano
      </Title>

      {/* Card principal do plano */}
      <Card
        style={{
          marginBottom: 24,
          borderLeft: `4px solid ${planColors[plan]}`,
          borderRadius: 8,
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: planColors[plan],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CrownOutlined style={{ fontSize: 22, color: '#fff' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Plano atual</Text>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{planLabels[plan]}</div>
                <Text type="secondary" style={{ fontSize: 13 }}>{fmt(planPrices[plan])}/mês</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Row gutter={[16, 12]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <ShopOutlined style={{ fontSize: 18, color: '#1677ff', marginBottom: 4 }} />
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{produtosNaLoja}<Text type="secondary" style={{ fontSize: 12 }}>/{maxProdutos === 999 ? '∞' : maxProdutos}</Text></div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Produtos</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <GiftOutlined style={{ fontSize: 18, color: '#52c41a', marginBottom: 4 }} />
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{beneficiosCount}<Text type="secondary" style={{ fontSize: 12 }}>/{totalBeneficios}</Text></div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Benefícios</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <ReadOutlined style={{ fontSize: 18, color: '#722ed1', marginBottom: 4 }} />
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{conteudosCount}<Text type="secondary" style={{ fontSize: 12 }}>/{totalConteudos}</Text></div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Conteúdos</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <CalendarOutlined style={{ fontSize: 18, color: '#fa8c16', marginBottom: 4 }} />
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{diasDesdeAtivacao}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Dias ativo</Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Uso do plano */}
        <Col xs={24} md={12}>
          <Card title="Uso do plano" size="small" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Produtos na loja</Text>
                <Text style={{ fontSize: 13 }}>{produtosNaLoja} de {maxProdutos === 999 ? 'ilimitado' : maxProdutos}</Text>
              </div>
              <Progress
                percent={maxProdutos === 999 ? 5 : Math.round((produtosNaLoja / maxProdutos) * 100)}
                strokeColor="#1677ff"
                size="small"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Benefícios liberados</Text>
                <Text style={{ fontSize: 13 }}>{beneficiosCount} de {totalBeneficios}</Text>
              </div>
              <Progress
                percent={Math.round((beneficiosCount / totalBeneficios) * 100)}
                strokeColor="#52c41a"
                size="small"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>Conteúdos acessíveis</Text>
                <Text style={{ fontSize: 13 }}>{conteudosCount} de {totalConteudos}</Text>
              </div>
              <Progress
                percent={Math.round((conteudosCount / totalConteudos) * 100)}
                strokeColor="#722ed1"
                size="small"
                showInfo={false}
              />
            </div>

            <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
              <Descriptions.Item label="Comissão extra">
                {plan === 'basico' ? <Text type="secondary">—</Text> : <Tag color="green">+{plan === 'intermediario' ? '2' : '5'}%</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Suporte">
                {plan === 'basico' ? 'Email' : plan === 'intermediario' ? 'Email + Chat' : 'Prioritário 24h'}
              </Descriptions.Item>
              <Descriptions.Item label="Relatórios">
                {plan === 'basico' ? 'Simples' : plan === 'intermediario' ? 'Completos' : 'Avançados + API'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Resumo financeiro */}
        <Col xs={24} md={12}>
          <Card title="Resumo da assinatura" size="small" style={{ height: '100%' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mensalidade">{fmt(planPrices[plan])}</Descriptions.Item>
              <Descriptions.Item label="Receita gerada">{fmt(receitaTotal)}</Descriptions.Item>
              <Descriptions.Item label="ROI">
                <Text style={{ color: receitaTotal > planPrices[plan] ? '#52c41a' : '#fa8c16', fontWeight: 600 }}>
                  {receitaTotal > 0 ? `${((receitaTotal / planPrices[plan]) * 100).toFixed(0)}%` : '—'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag icon={<CheckCircleOutlined />} color="success">Ativo</Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{
              marginTop: 16, padding: 12, borderRadius: 8,
              background: '#f6ffed', border: '1px solid #b7eb8f',
            }}>
              <Text style={{ fontSize: 12, color: '#389e0d' }}>
                <StarOutlined style={{ marginRight: 4 }} />
                Sua receita já cobre {receitaTotal > 0 ? `${((receitaTotal / planPrices[plan])).toFixed(1)}x` : '0x'} o valor da sua assinatura
              </Text>
            </div>

            {planIdx === 2 && (
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 8,
                background: '#fffbe6', border: '1px solid #ffe58f',
              }}>
                <Text style={{ fontSize: 12, color: '#d48806' }}>
                  <CrownOutlined style={{ marginRight: 4 }} />
                  Você está no plano mais completo da plataforma
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Upgrade CTA */}
      {nextPlan && (
        <Card
          style={{
            marginTop: 16,
            background: `linear-gradient(135deg, ${planColors[nextPlan]}08 0%, ${planColors[nextPlan]}15 100%)`,
            borderColor: `${planColors[nextPlan]}40`,
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 16 }}>
                  <ThunderboltOutlined style={{ color: planColors[nextPlan], marginRight: 6 }} />
                  Fazer upgrade para {planLabels[nextPlan]}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Desbloqueie mais {extraBeneficiosNext > 0 ? `${extraBeneficiosNext} benefícios` : ''}
                  {extraBeneficiosNext > 0 && extraConteudosNext > 0 ? ', ' : ''}
                  {extraConteudosNext > 0 ? `${extraConteudosNext} conteúdos` : ''}
                  {nextPlan === 'intermediario' ? ', +2% de comissão e chat com suporte' : ', +5% de comissão e suporte prioritário 24h'}
                  {' '}por mais {fmt(planPrices[nextPlan] - planPrices[plan])}/mês.
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                size="large"
                icon={<RiseOutlined />}
                style={{ background: planColors[nextPlan], borderColor: planColors[nextPlan] }}
                onClick={() => message.info('Funcionalidade de upgrade em breve! Contate o suporte.')}
              >
                {fmt(planPrices[nextPlan])}/mês
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
