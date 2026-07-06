import { Card, Typography, Tag, Row, Col, Button, message } from 'antd';
import {
  CrownOutlined, CheckOutlined, CloseOutlined, RiseOutlined,
  GiftOutlined, ReadOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];
const planLabels: Record<PlanType, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<PlanType, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
const planPrices: Record<PlanType, number> = { basico: 49.90, intermediario: 99.90, avancado: 199.90 };

interface PlanFeature {
  label: string;
  basico: boolean | string;
  intermediario: boolean | string;
  avancado: boolean | string;
}

const features: PlanFeature[] = [
  { label: 'Loja Virtual', basico: true, intermediario: true, avancado: true },
  { label: 'Produtos na Loja', basico: 'Até 20', intermediario: 'Até 50', avancado: 'Ilimitado' },
  { label: 'Benefícios', basico: 'Básicos', intermediario: 'Intermediários', avancado: 'Todos' },
  { label: 'Conteúdos Exclusivos', basico: false, intermediario: true, avancado: true },
  { label: 'Assessoria Profissional', basico: false, intermediario: 'Básica', avancado: 'Completa' },
  { label: 'Relatórios de Vendas', basico: 'Simples', intermediario: 'Completos', avancado: 'Avançados + API' },
  { label: 'Suporte', basico: 'Email', intermediario: 'Email + Chat', avancado: 'Prioritário 24h' },
  { label: 'Comissão Extra', basico: false, intermediario: '+2%', avancado: '+5%' },
];

export default function MeuPlanoPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const conteudos = useAppSelector((s) => s.conteudos.list);
  const { user } = useAppSelector((s) => s.auth);

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const plan = (associado?.planType || user?.plan || 'basico') as PlanType;
  const planIdx = planOrder.indexOf(plan);

  const beneficiosCount = beneficios.filter((b) => b.status === 'ativo' && planOrder.indexOf(b.minPlan) <= planIdx).length;
  const conteudosCount = conteudos.filter((c) => c.status === 'publicado' && planOrder.indexOf(c.minPlan) <= planIdx).length;

  const renderVal = (val: boolean | string) => {
    if (val === true) return <CheckOutlined style={{ color: '#52c41a' }} />;
    if (val === false) return <CloseOutlined style={{ color: '#d9d9d9' }} />;
    return <Text style={{ fontSize: 12 }}>{val}</Text>;
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <CrownOutlined style={{ marginRight: 8 }} />
        Meu Plano
      </Title>

      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)' }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Tag color={planColors[plan]} style={{ fontSize: 18, padding: '6px 16px' }}>{planLabels[plan]}</Tag>
          </Col>
          <Col flex={1}>
            <Text style={{ fontSize: 28, fontWeight: 700 }}>R$ {planPrices[plan].toFixed(2)}</Text>
            <Text type="secondary"> /mês</Text>
          </Col>
          <Col>
            <Row gutter={24}>
              <Col style={{ textAlign: 'center' }}>
                <GiftOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>{beneficiosCount}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>Benefícios</Text>
              </Col>
              <Col style={{ textAlign: 'center' }}>
                <ReadOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>{conteudosCount}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>Conteúdos</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Title level={5}>Comparativo de Planos</Title>
      <Card size="small">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #f0f0f0' }}>Recurso</th>
              {planOrder.map((p) => (
                <th key={p} style={{
                  textAlign: 'center', padding: '8px 12px', borderBottom: '2px solid #f0f0f0',
                  background: p === plan ? '#e6f7ff' : undefined,
                }}>
                  <Tag color={planColors[p]}>{planLabels[p]}</Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>R$ {planPrices[p].toFixed(2)}</Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : undefined }}>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text style={{ fontSize: 13 }}>{f.label}</Text></td>
                {planOrder.map((p) => (
                  <td key={p} style={{
                    textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f0f0',
                    background: p === plan ? '#e6f7ff' : undefined,
                  }}>
                    {renderVal(f[p])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {planIdx < 2 && (
        <Card style={{ marginTop: 16 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                <RiseOutlined style={{ marginRight: 8 }} />
                Fazer Upgrade
              </Title>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                Atualize para o plano <Tag color={planColors[planOrder[planIdx + 1]]}>{planLabels[planOrder[planIdx + 1]]}</Tag>
                e desbloqueie mais benefícios, conteúdos e recursos.
              </Paragraph>
            </Col>
            <Col>
              <Button type="primary" size="large" icon={<CrownOutlined />}
                onClick={() => message.info('Funcionalidade de upgrade em breve! Contate o suporte.')}>
                Upgrade para {planLabels[planOrder[planIdx + 1]]} — R$ {planPrices[planOrder[planIdx + 1]].toFixed(2)}/mês
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
